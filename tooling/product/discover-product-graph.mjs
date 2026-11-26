import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { frameworkPortNames } from '../package-model.mjs';
import { discoverProductUnits, repoRoot } from '../testing/discover-product-units.mjs';
import { componentPackageProjectionPath } from './package-layout.mjs';
import { discoverComponentRoots } from './component-paths.mjs';

const productKinds = Object.freeze({
  components: 'component',
  capabilities: 'capability',
  foundations: 'foundation',
  catalogs: 'catalog',
  patterns: 'pattern',
});
const componentTargets = Object.freeze(['core', 'web', ...frameworkPortNames]);
const capabilityTargets = Object.freeze(['core']);
const packageForTarget = Object.freeze(Object.fromEntries(componentTargets.map((target) => [target, target])));

function exists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function directories(root, relativePath) {
  const absolute = path.join(root, relativePath);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^[a-z][a-z0-9-]*$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function titleCase(id) {
  return id.split('-').map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : part).join(' ');
}

function packageManifestMap(discovery) {
  return new Map(discovery.packages.map(({ name, manifest }) => [name, manifest]));
}

function packagePublicName(manifests, packageName) {
  return manifests.get(packageName)?.name ?? `@vyrnforge/${packageName}`;
}

function componentPublicEntrypoints(manifests, target, componentId) {
  const packageName = packageForTarget[target];
  const manifest = manifests.get(packageName);
  if (!manifest?.exports) return [];
  const publicName = packagePublicName(manifests, packageName);

  if (target === 'web') {
    const subpath = `./styles/${componentId}.css`;
    return manifest.exports[subpath] ? [`${publicName}/styles/${componentId}.css`] : [];
  }
  if (target === 'core') return [];

  const subpath = `./${componentId}`;
  return manifest.exports[subpath] ? [`${publicName}/${componentId}`] : [];
}

function canonicalComponentSurface(root, canonicalRoot, target) {
  const relativePath = `${canonicalRoot}/${target}/`;
  return exists(root, relativePath) ? relativePath : null;
}

function normalizeComponentSurface(root, manifests, component, canonicalRoot, componentId, target) {
  const canonicalPath = canonicalComponentSurface(root, canonicalRoot, target);
  const evidence = component?.ports?.[target] ?? null;
  if (!canonicalPath && !evidence) return null;

  return {
    target,
    package: packageForTarget[target],
    authoringMode: 'product-unit',
    authoringPaths: canonicalPath ? [canonicalPath] : [],
    projectionPath: componentPackageProjectionPath(target, componentId),
    legacyPaths: [],
    publicEntrypoints: componentPublicEntrypoints(manifests, target, componentId),
    dependencies: evidence?.dependencies ?? [],
    browser: evidence?.browser ?? false,
    types: evidence?.types ?? null,
    ssr: evidence?.ssr ?? null,
  };
}

function componentMetadata(root, canonicalRoot) {
  const canonicalPath = `${canonicalRoot}/component.json`;
  return { path: canonicalPath, value: readJson(root, canonicalPath), source: 'product-unit' };
}

function componentFacets(root, canonicalRoot) {
  const facet = (name) => {
    const canonicalPath = `${canonicalRoot}/${name}/`;
    return exists(root, canonicalPath) ? canonicalPath : null;
  };
  return {
    root: `${canonicalRoot}/`,
    canonicalRoot: `${canonicalRoot}/`,
    legacyRoot: null,
    contract: facet('contract'),
    docs: facet('docs'),
    examples: facet('examples'),
    test: facet('test'),
  };
}

function normalizeComponentNode(root, manifests, componentId, discoveredComponent, componentRoots) {
  const location = componentRoots.get(componentId);
  const canonicalRoot = location.root;
  const metadata = componentMetadata(root, canonicalRoot);
  const facets = componentFacets(root, canonicalRoot);
  const surfaces = Object.fromEntries(
    componentTargets
      .map((target) => [target, normalizeComponentSurface(root, manifests, discoveredComponent, canonicalRoot, componentId, target)])
      .filter(([, surface]) => surface),
  );
  const packages = unique(Object.values(surfaces).map((surface) => surface.package));
  const publicEntrypoints = unique(Object.values(surfaces).flatMap((surface) => surface.publicEntrypoints));

  return {
    id: `component:${componentId}`,
    unitId: componentId,
    kind: 'component',
    responsibility: location.responsibility,
    family: location.family,
    name: metadata.value?.name ?? titleCase(componentId),
    status: discoveredComponent?.status ?? (publicEntrypoints.length ? 'implemented' : 'unprojected'),
    metadataPath: metadata.path,
    metadataSource: metadata.source,
    documentationGroup: metadata.value?.group ?? metadata.value?.documentation?.group ?? discoveredComponent?.documentationGroup ?? null,
    facets,
    surfaces,
    packages,
    publicEntrypoints,
    dependencies: unique(Object.values(surfaces).flatMap((surface) => surface.dependencies)),
    migration: {
      state: 'product-unit',
      canonicalRoot: facets.canonicalRoot,
      legacyRoot: facets.legacyRoot,
    },
  };
}

function patternFacets(root, patternId) {
  const canonicalRoot = `product/patterns/${patternId}`;
  const facet = (name) => {
    const relativePath = `${canonicalRoot}/${name}/`;
    return exists(root, relativePath) ? relativePath : null;
  };
  return {
    root: `${canonicalRoot}/`,
    canonicalRoot: `${canonicalRoot}/`,
    legacyRoot: null,
    contract: facet('contract'),
    docs: facet('docs'),
    examples: facet('examples'),
    test: facet('test'),
  };
}

function isFile(root, relativePath) {
  return exists(root, relativePath) && statSync(path.join(root, relativePath)).isFile();
}

// Imports in canonical component sources resolve in their existing projected
// package layout (e.g. Drawer -> ../dialog/index.js), not in product folders.
// Walk only the surfaces reached by the real example; keep usage separate
// from package projection and the existing owned-unit dependency model.
function patternUsageClosure(root, components, manifests, directUsage) {
  const surfaces = components.flatMap((component) => Object.values(component.surfaces)
    .filter((surface) => surface.projectionPath && surface.authoringPaths.length)
    .map((surface) => ({ component: component.unitId, port: surface.target, surface })));
  const visited = new Set();
  const result = new Map();
  const queue = [...directUsage];

  const projectedOwner = (projected) => surfaces.find(({ surface }) => projected.startsWith(surface.projectionPath));
  const publicTarget = (specifier) => {
    const match = /^@vyrnforge\/([^/]+)(?:\/(.+))?$/.exec(specifier);
    if (!match) return null;
    const manifest = manifests.get(match[1]);
    const entry = manifest?.exports?.[match[2] ? './' + match[2] : '.'];
    const target = typeof entry === 'string' ? entry : entry?.import ?? entry?.default ?? entry?.types;
    if (typeof target !== 'string') throw new Error('Unresolved pattern usage import: ' + specifier);
    return 'packages/' + match[1] + '/' + target.replace(/^\.\//, '').replace(/^dist\//, 'src/');
  };

  const walkSource = (directory) => {
    const files = [];
    for (const entry of readdirSync(path.join(root, directory), { withFileTypes: true })) {
      const file = directory + entry.name;
      if (entry.isDirectory()) files.push(...walkSource(file + '/'));
      else if (/\.(?:[cm]?[jt]sx?|css)$/.test(entry.name)) files.push(file);
    }
    return files.sort();
  };

  const sourceExists = (file) => [file, file.replace(/\.m?js$/, '.ts'), file.replace(/\.js$/, '.tsx'), file + '/index.ts']
    .some((candidate) => isFile(root, candidate));

  while (queue.length) {
    const edge = queue.shift();
    const key = edge.component + ':' + edge.port;
    if (visited.has(key)) continue;
    visited.add(key);
    const current = surfaces.find((entry) => entry.component === edge.component && entry.port === edge.port);
    if (!current) throw new Error('Unresolved pattern usage surface: ' + key);
    result.set(key, { component: edge.component, port: edge.port });
    for (const authoring of current.surface.authoringPaths) {
      for (const file of walkSource(authoring)) {
        const source = readFileSync(path.join(root, file), 'utf8');
        const projectedFile = current.surface.projectionPath + file.slice(authoring.length);
        const imports = file.endsWith('.css')
          ? source.matchAll(/@import\s+(?:url\(\s*)?['"]([^'"]+)['"]/g)
          : source.matchAll(/(?:\bfrom\s+|\bimport\s*)['"]([^'"]+)['"]/g);
        for (const [, specifier] of imports) {
          let projected;
          if (specifier.startsWith('.')) projected = path.posix.normalize(path.posix.join(path.posix.dirname(projectedFile), specifier));
          else if (specifier.startsWith('@vyrnforge/')) projected = publicTarget(specifier);
          else continue;
          const dependency = projectedOwner(projected);
          if (dependency) {
            const suffix = projected.slice(dependency.surface.projectionPath.length);
            if (!dependency.surface.authoringPaths.some((directory) => sourceExists(directory + suffix))) {
              throw new Error('Unresolved pattern usage source: ' + specifier + ' from ' + file);
            }
            queue.push({ component: dependency.component, port: dependency.port });
          } else {
            // Shared package files and Core capabilities remain covered by
            // existing package/owned-unit fanout; an unknown internal import
            // must not silently narrow the task evidence.
            const sharedCapability = specifier.startsWith('@vyrnforge/core/') &&
              current.surface.dependencies.some((id) => id.endsWith(':' + specifier.split('/').at(-1)));
            if (!sharedCapability && !sourceExists(projected)) {
              throw new Error('Unresolved pattern usage import: ' + specifier + ' from ' + file);
            }
          }
        }
      }
    }
  }
  return [...result.values()].sort((a, b) => (a.component + ':' + a.port).localeCompare(b.component + ':' + b.port));
}

function resolvePatternReferences(root, metadata, components, manifests, patternId) {
  const refs = metadata.exampleReferences ?? [];
  if (!Array.isArray(refs)) throw new Error('Pattern exampleReferences must be an array');
  const seen = new Set();
  return refs.map((ref) => {
    const owner = components.find((component) => component.id === ref?.owner);
    if (!owner?.facets.examples || typeof ref.id !== 'string' || !ref.id.startsWith(owner.unitId + '/')) {
      throw new Error('Invalid pattern example owner: ' + ref?.id);
    }
    const slug = ref.id.slice(owner.unitId.length + 1);
    if (!/^[a-z][a-z0-9-]*$/.test(slug) || seen.has(ref.id)) throw new Error('Invalid or duplicate pattern example: ' + ref.id);
    seen.add(ref.id);
    const directory = owner.facets.examples + slug + '/';
    const manifestPath = directory + 'example.json';
    if (!isFile(root, manifestPath)) throw new Error('Missing pattern example manifest: ' + ref.id);
    const manifest = readJson(root, manifestPath);
    if (manifest.id !== ref.id) throw new Error('Pattern example identity mismatch: ' + ref.id);
    const adaptations = Object.entries(manifest.frameworks ?? {});
    if (!adaptations.length) throw new Error('Pattern example has no framework source: ' + ref.id);
    const frameworks = adaptations.map(([framework, adaptation]) => {
      const port = framework === 'native-web' ? 'web' : framework;
      if (!['web', ...frameworkPortNames].includes(port) || framework === 'web') throw new Error('Unsupported example framework: ' + framework);
      if (!adaptation?.source || !/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(adaptation.source) || !isFile(root, directory + adaptation.source)) throw new Error('Missing or invalid example source: ' + ref.id);
      const sourcePath = directory + adaptation.source;
      const source = readFileSync(path.join(root, sourcePath), 'utf8');
      const dependencies = unique([...source.matchAll(/(?:from\s+|import\s*)['"](@vyrnforge\/[^'"]+)['"]/g)].map((match) => match[1]));
      const usage = dependencies.map((specifier) => {
        const component = components.find((candidate) => candidate.publicEntrypoints.includes(specifier));
        if (!component) throw new Error('Unresolved pattern example dependency: ' + specifier);
        const surface = Object.values(component.surfaces).find((candidate) => candidate.publicEntrypoints.includes(specifier));
        return { component: component.unitId, port: surface.target, specifier };
      });
      return { framework, port, sourcePath, usage, usageClosure: patternUsageClosure(root, components, manifests, usage) };
    });
    const evidence = ref.evidence;
    const testRoot = owner.facets.test;
    const patternTestRoot = `product/patterns/${patternId}/test/`;
    const isScopedFile = (file, roots) =>
      typeof file === 'string' && !file.includes('..') &&
      roots.some((allowedRoot) => allowedRoot && file.startsWith(allowedRoot)) && isFile(root, file);
    if (!testRoot || !evidence || !frameworks.some((entry) => entry.port === evidence.port) ||
        !owner.surfaces[evidence.port]?.browser ||
        !isScopedFile(evidence.fixture, [testRoot]) ||
        !isScopedFile(evidence.spec, [testRoot, patternTestRoot])) {
      throw new Error('Invalid pattern evidence reference: ' + ref.id);
    }
    const specSource = readFileSync(path.join(root, evidence.spec), 'utf8');
    const fixtureSource = readFileSync(path.join(root, evidence.fixture), 'utf8');
    if (typeof evidence.fixtureUrl !== 'string' || typeof evidence.testName !== 'string' ||
        !evidence.testName || !evidence.fixtureUrl.startsWith('/components/' + owner.unitId + '/') ||
        !evidence.fixtureUrl.endsWith('-' + evidence.port + '.html') ||
        !specSource.includes(evidence.fixtureUrl) || !specSource.includes(evidence.testName) || !fixtureSource.includes(slug)) {
      throw new Error('Unresolved pattern fixture or test identity: ' + ref.id);
    }
    return { id: ref.id, title: manifest.title, owner: owner.id, directory, manifestPath, frameworks, evidence };
  });
}

function normalizePatternNode(root, manifests, patternId, components) {
  const canonicalRoot = `product/patterns/${patternId}`;
  const metadataPath = `${canonicalRoot}/pattern.json`;
  const metadata = exists(root, metadataPath) ? readJson(root, metadataPath) : null;
  if (metadata?.id !== patternId) throw new Error('Pattern metadata identity mismatch: ' + patternId);
  const facets = patternFacets(root, patternId);
  const exampleReferences = resolvePatternReferences(root, metadata, components, manifests, patternId);
  const surfaces = Object.fromEntries(['web', 'react'].flatMap((target) => {
    const authoringPath = `${canonicalRoot}/${target}/`;
    if (!exists(root, authoringPath)) return [];
    const publicEntrypoints = componentPublicEntrypoints(manifests, target, patternId);
    if (target === 'react' && (!publicEntrypoints.length || !exists(root, authoringPath + 'index.ts'))) {
      throw new Error('Pattern React adaptation requires an explicit public entrypoint and source: ' + patternId);
    }
    return [[target, {
      target,
      package: target,
      authoringMode: 'product-unit',
      authoringPaths: [authoringPath],
      projectionPath: componentPackageProjectionPath(target, patternId),
      legacyPaths: [],
      publicEntrypoints,
      dependencies: [],
      browser: true,
      types: target === 'react' ? `packages/react/test/components/${patternId}/api.types.ts` : null,
      ssr: target === 'react' ? `packages/react/test/components/${patternId}/ssr.test.mjs` : null,
    }]];
  }));
  const publicEntrypoints = unique(Object.values(surfaces).flatMap(surface => surface.publicEntrypoints));
  return {
    id: `pattern:${patternId}`,
    unitId: patternId,
    kind: 'pattern',
    responsibility: null,
    family: null,
    name: metadata?.name ?? titleCase(patternId),
    status: publicEntrypoints.length ? 'implemented' : 'unprojected',
    metadataPath,
    metadataSource: metadata ? 'product-unit' : 'missing',
    exampleReferences,
    documentationAvailable: Boolean(facets.docs && exists(root, facets.docs + 'index.md')),
    documentationGroup: metadata?.documentation?.group ?? metadata?.group ?? null,
    facets,
    surfaces,
    packages: unique(Object.values(surfaces).map((surface) => surface.package)),
    publicEntrypoints,
    dependencies: unique(Object.values(surfaces).flatMap((surface) => surface.dependencies)),
    migration: {
      state: 'product-unit',
      canonicalRoot: `${canonicalRoot}/`,
      legacyRoot: null,
    },
  };
}

function canonicalUnitNodes(root, manifests) {
  const nodes = [];
  for (const [directory, kind] of Object.entries(productKinds)) {
    if (kind === 'component' || kind === 'pattern') continue;
    for (const unitId of directories(root, `product/${directory}`)) {
      const unitRoot = `product/${directory}/${unitId}/`;
      if (kind === 'capability') {
        const surfaces = Object.fromEntries(capabilityTargets.flatMap((target) => {
          const authoringPath = `${unitRoot}${target}/`;
          if (!exists(root, authoringPath)) return [];
          const packageName = packageForTarget[target];
          const manifest = manifests.get(packageName);
          const publicName = packagePublicName(manifests, packageName);
          const exportName = `./${unitId}`;
          return [[target, {
            target,
            package: packageName,
            authoringMode: 'product-unit',
            authoringPaths: [authoringPath],
            projectionPath: `packages/${packageName}/src/capabilities/${unitId}/`,
            legacyPaths: [],
            publicEntrypoints: manifest?.exports?.[exportName] ? [`${publicName}/${unitId}`] : [],
            dependencies: [],
            browser: false,
            types: null,
            ssr: null,
          }]];
        }));
        nodes.push({
          id: `${kind}:${unitId}`,
          unitId,
          kind,
          name: titleCase(unitId),
          root: unitRoot,
          authoringMode: 'product-unit',
          surfaces,
          packages: unique(Object.values(surfaces).map((surface) => surface.package)),
          publicEntrypoints: unique(Object.values(surfaces).flatMap((surface) => surface.publicEntrypoints)),
          dependencies: [],
          testPath: exists(root, `${unitRoot}test/`) ? `${unitRoot}test/` : null,
          metadataPath: unitRoot,
          legacyNodes: [],
          migration: { state: 'product-unit', canonicalRoot: unitRoot },
        });
        continue;
      }
      nodes.push({
        id: `${kind}:${unitId}`,
        unitId,
        kind,
        name: titleCase(unitId),
        root: unitRoot,
        authoringMode: 'product-unit',
        packages: [],
        dependencies: [],
        legacyNodes: [],
        migration: { state: 'product-unit', canonicalRoot: unitRoot },
      });
    }
  }
  return nodes;
}

function normalizeLegacyOwnedUnits(discovery, canonicalNodes) {
  const canonicalByLogicalId = new Map(canonicalNodes.map((node) => [`${node.kind}:${node.unitId}`, node]));
  const standalone = [];

  for (const unit of discovery.ownedUnits) {
    const normalizedKind = unit.kind === 'capabilities'
      ? 'capability'
      : unit.kind === 'foundations'
        ? 'foundation'
        : 'legacy-unit';
    const logicalId = `${normalizedKind}:${unit.id}`;
    const canonical = canonicalByLogicalId.get(logicalId);
    const legacyProjection = {
      node: unit.node,
      package: unit.package,
      sourcePath: unit.sourcePath,
      testPath: unit.testPath,
      metadataPath: unit.metadataPath,
      evidenceFiles: unit.evidenceFiles,
      dependencies: unit.dependencies,
    };

    if (canonical) {
      canonical.packages = unique([...canonical.packages, ...(unit.packages ?? [unit.package])]);
      canonical.dependencies = unique([...canonical.dependencies, ...unit.dependencies]);
      if (unit.authoringMode === 'product-unit') {
        canonical.testPath ??= unit.testPath ?? null;
        canonical.metadataPath ??= unit.metadataPath ?? canonical.root;
        continue;
      }
      canonical.legacyNodes.push(legacyProjection);
      canonical.migration = { ...canonical.migration, state: 'mixed' };
      continue;
    }

    standalone.push({
      id: unit.node,
      unitId: unit.id,
      kind: normalizedKind,
      legacyKind: unit.kind,
      name: titleCase(unit.id),
      root: unit.sourcePath,
      authoringMode: 'legacy-package',
      packages: [unit.package],
      dependencies: unit.dependencies,
      legacyNodes: [legacyProjection],
      migration: { state: 'legacy', canonicalRoot: null },
    });
  }

  return standalone;
}

export function discoverProductGraph(root = repoRoot) {
  const discovery = discoverProductUnits(root);
  const manifests = packageManifestMap(discovery);
  const discoveredComponents = new Map(discovery.components.map((component) => [component.component, component]));
  const componentRoots = discoverComponentRoots(root);
  const componentIds = unique([...componentRoots.keys()]);
  const components = componentIds.map((componentId) =>
    normalizeComponentNode(root, manifests, componentId, discoveredComponents.get(componentId), componentRoots),
  );
  const patterns = directories(root, 'product/patterns').map((patternId) =>
    normalizePatternNode(root, manifests, patternId, components),
  );
  const canonicalUnits = canonicalUnitNodes(root, manifests);
  const legacyUnits = normalizeLegacyOwnedUnits(discovery, canonicalUnits);
  const units = [...components, ...patterns, ...canonicalUnits, ...legacyUnits].sort((a, b) => a.id.localeCompare(b.id));

  return {
    schemaVersion: 3,
    root,
    packages: discovery.packages.map(({ name, manifest }) => ({
      id: name,
      name: manifest.name ?? `@vyrnforge/${name}`,
      version: manifest.version ?? null,
      manifestPath: `packages/${name}/package.json`,
      manifest,
    })),
    components,
    patterns,
    units,
    legacyDiscovery: discovery,
  };
}

export function productGraphProblems(root = repoRoot) {
  const graph = discoverProductGraph(root);
  const problems = [];
  const ids = new Set();

  for (const unit of graph.units) {
    if (ids.has(unit.id)) problems.push(`duplicate product graph node: ${unit.id}`);
    ids.add(unit.id);
  }

  for (const owner of [...graph.components, ...graph.patterns]) {
    if (!owner.facets.canonicalRoot && !owner.facets.legacyRoot && owner.publicEntrypoints.length === 0) {
      problems.push(`${owner.id} has no product ownership root and no public projection`);
    }
    if (owner.metadataSource === 'missing') {
      problems.push(`${owner.id} is missing owned metadata at ${owner.metadataPath}`);
    }
    for (const surface of Object.values(owner.surfaces)) {
      if (!surface.authoringPaths.length) problems.push(`${owner.id}/${surface.target} has no authoring source`);
      if (surface.authoringMode === 'product-unit' && !surface.projectionPath) {
        problems.push(`${owner.id}/${surface.target} has no package projection destination`);
      }
      if (!graph.packages.some((pkg) => pkg.id === surface.package)) {
        problems.push(`${owner.id}/${surface.target} projects to unknown package ${surface.package}`);
      }
    }
  }

  for (const capability of graph.units.filter((unit) => unit.kind === 'capability' && unit.surfaces)) {
    for (const surface of Object.values(capability.surfaces)) {
      if (!surface.authoringPaths.length) problems.push(`${capability.id}/${surface.target} has no authoring source`);
      if (!surface.projectionPath) problems.push(`${capability.id}/${surface.target} has no package projection destination`);
      if (!graph.packages.some((pkg) => pkg.id === surface.package)) {
        problems.push(`${capability.id}/${surface.target} projects to unknown package ${surface.package}`);
      }
    }
    if (!capability.testPath) problems.push(`${capability.id} has no canonical product-unit test path`);
  }

  return problems;
}

export function assertProductGraph(root = repoRoot) {
  const problems = productGraphProblems(root);
  if (problems.length) throw new Error(`Product Graph validation failed:\n- ${problems.join('\n- ')}`);
  return discoverProductGraph(root);
}
