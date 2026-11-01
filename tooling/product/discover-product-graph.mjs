import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { frameworkPortNames } from '../package-model.mjs';
import { discoverProductUnits, repoRoot } from '../testing/discover-product-units.mjs';
import { componentPackageProjectionPath } from './package-layout.mjs';

const productKinds = Object.freeze({
  components: 'component',
  capabilities: 'capability',
  foundations: 'foundation',
  catalogs: 'catalog',
});
const componentTargets = Object.freeze(['core', 'web', ...frameworkPortNames]);
const reservedLegacyProductRoots = new Set(Object.keys(productKinds));
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

function canonicalComponentSurface(root, componentId, target) {
  const relativePath = `product/components/${componentId}/${target}/`;
  return exists(root, relativePath) ? relativePath : null;
}

function normalizeComponentSurface(root, manifests, component, componentId, target) {
  const canonicalPath = canonicalComponentSurface(root, componentId, target);
  const legacy = component?.ports?.[target] ?? null;
  if (!canonicalPath && !legacy) return null;

  const legacyPaths = (legacy?.paths ?? []).filter((relativePath) => exists(root, relativePath.replace(/\/$/, '')));
  return {
    target,
    package: packageForTarget[target],
    authoringMode: canonicalPath ? 'product-unit' : 'legacy-package',
    authoringPaths: canonicalPath ? [canonicalPath] : legacyPaths.length ? [legacyPaths[0]] : [],
    projectionPath: componentPackageProjectionPath(target, componentId) ?? legacyPaths[0] ?? null,
    legacyPaths,
    publicEntrypoints: componentPublicEntrypoints(manifests, target, componentId),
    dependencies: legacy?.dependencies ?? [],
    browser: legacy?.browser ?? false,
    types: legacy?.types ?? null,
    ssr: legacy?.ssr ?? null,
  };
}

function componentMetadata(root, componentId) {
  const canonicalPath = `product/components/${componentId}/component.json`;
  const legacyPath = `product/${componentId}/component.json`;
  if (exists(root, canonicalPath)) {
    return { path: canonicalPath, value: readJson(root, canonicalPath), source: 'product-unit' };
  }
  if (exists(root, legacyPath)) {
    return { path: legacyPath, value: readJson(root, legacyPath), source: 'legacy-product-slice' };
  }
  return { path: canonicalPath, value: null, source: 'missing' };
}

function componentFacets(root, componentId) {
  const canonicalRoot = `product/components/${componentId}`;
  const legacyRoot = `product/${componentId}`;
  const hasCanonicalRoot = exists(root, canonicalRoot);
  const hasLegacyRoot = exists(root, legacyRoot);
  const facet = (name) => {
    const canonicalPath = `${canonicalRoot}/${name}/`;
    if (exists(root, canonicalPath)) return canonicalPath;
    const legacyPath = `${legacyRoot}/${name}/`;
    return exists(root, legacyPath) ? legacyPath : null;
  };

  return {
    root: hasCanonicalRoot ? `${canonicalRoot}/` : hasLegacyRoot ? `${legacyRoot}/` : `${canonicalRoot}/`,
    canonicalRoot: hasCanonicalRoot ? `${canonicalRoot}/` : null,
    legacyRoot: hasLegacyRoot ? `${legacyRoot}/` : null,
    contract: facet('contract'),
    docs: facet('docs'),
    examples: facet('examples'),
    test: facet('test'),
  };
}

function normalizeComponentNode(root, manifests, componentId, legacyComponent) {
  const metadata = componentMetadata(root, componentId);
  const facets = componentFacets(root, componentId);
  const surfaces = Object.fromEntries(
    componentTargets
      .map((target) => [target, normalizeComponentSurface(root, manifests, legacyComponent, componentId, target)])
      .filter(([, surface]) => surface),
  );
  const packages = unique(Object.values(surfaces).map((surface) => surface.package));
  const publicEntrypoints = unique(Object.values(surfaces).flatMap((surface) => surface.publicEntrypoints));
  const hasCanonicalSurface = Object.values(surfaces).some((surface) => surface.authoringMode === 'product-unit');
  const hasLegacySurface = Object.values(surfaces).some((surface) => surface.legacyPaths.length > 0);
  const migrationState = facets.canonicalRoot || hasCanonicalSurface
    ? (facets.legacyRoot || hasLegacySurface ? 'mixed' : 'product-unit')
    : 'legacy';

  return {
    id: `component:${componentId}`,
    unitId: componentId,
    kind: 'component',
    name: metadata.value?.name ?? titleCase(componentId),
    status: legacyComponent?.status ?? (publicEntrypoints.length ? 'implemented' : 'unprojected'),
    metadataPath: metadata.path,
    metadataSource: metadata.source,
    documentationGroup: metadata.value?.group ?? metadata.value?.documentation?.group ?? legacyComponent?.documentationGroup ?? null,
    facets,
    surfaces,
    packages,
    publicEntrypoints,
    dependencies: unique(Object.values(surfaces).flatMap((surface) => surface.dependencies)),
    migration: {
      state: migrationState,
      canonicalRoot: facets.canonicalRoot,
      legacyRoot: facets.legacyRoot,
    },
  };
}

function canonicalUnitNodes(root) {
  const nodes = [];
  for (const [directory, kind] of Object.entries(productKinds)) {
    if (kind === 'component') continue;
    for (const unitId of directories(root, `product/${directory}`)) {
      const unitRoot = `product/${directory}/${unitId}/`;
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
      canonical.packages = unique([...canonical.packages, unit.package]);
      canonical.dependencies = unique([...canonical.dependencies, ...unit.dependencies]);
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
  const legacyComponents = new Map(
    discovery.components
      .filter((component) => !reservedLegacyProductRoots.has(component.component))
      .map((component) => [component.component, component]),
  );
  const componentIds = unique([...legacyComponents.keys(), ...directories(root, 'product/components')]);
  const components = componentIds.map((componentId) =>
    normalizeComponentNode(root, manifests, componentId, legacyComponents.get(componentId)),
  );
  const canonicalUnits = canonicalUnitNodes(root);
  const legacyUnits = normalizeLegacyOwnedUnits(discovery, canonicalUnits);
  const units = [...components, ...canonicalUnits, ...legacyUnits].sort((a, b) => a.id.localeCompare(b.id));

  return {
    schemaVersion: 2,
    root,
    packages: discovery.packages.map(({ name, manifest }) => ({
      id: name,
      name: manifest.name ?? `@vyrnforge/${name}`,
      version: manifest.version ?? null,
      manifestPath: `packages/${name}/package.json`,
      manifest,
    })),
    components,
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

  for (const component of graph.components) {
    if (!component.facets.canonicalRoot && !component.facets.legacyRoot && component.publicEntrypoints.length === 0) {
      problems.push(`${component.id} has no product ownership root and no public projection`);
    }
    for (const surface of Object.values(component.surfaces)) {
      if (!surface.authoringPaths.length) problems.push(`${component.id}/${surface.target} has no authoring source`);
      if (surface.authoringMode === 'product-unit' && !surface.projectionPath) {
        problems.push(`${component.id}/${surface.target} has no package projection destination`);
      }
      if (!graph.packages.some((pkg) => pkg.id === surface.package)) {
        problems.push(`${component.id}/${surface.target} projects to unknown package ${surface.package}`);
      }
    }
  }

  return problems;
}

export function assertProductGraph(root = repoRoot) {
  const problems = productGraphProblems(root);
  if (problems.length) throw new Error(`Product Graph validation failed:\n- ${problems.join('\n- ')}`);
  return discoverProductGraph(root);
}
