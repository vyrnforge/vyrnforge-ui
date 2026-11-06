import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  frameworkPortNames,
  publicPackageNames,
  ssrPortNames,
} from '../package-model.mjs';
import { discoverComponentRoots } from '../product/component-paths.mjs';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const frameworkPorts = frameworkPortNames;
const ssrPorts = new Set(ssrPortNames);
const sourceExtensions = ['.ts', '.tsx', '.mts', '.cts'];
const ownedKinds = ['capabilities', 'accessibility', 'foundations'];
const webFoundationStyleIds = new Set(['tokens', 'foundation', 'reset']);
const reservedProductRoots = new Set(['components', 'capabilities', 'foundations', 'catalogs']);

function readJson(root, relativePath) { return JSON.parse(readFileSync(path.join(root, relativePath), 'utf8')); }
function existingPath(root, relativePath) { return existsSync(path.join(root, relativePath)); }
function directories(root, relativePath) {
  const absolute = path.join(root, relativePath);
  if (!existsSync(absolute)) return [];
  return readdirSync(absolute, { withFileTypes: true }).filter((entry) => entry.isDirectory() && /^[a-z][a-z0-9-]*$/.test(entry.name)).map((entry) => entry.name).sort();
}
function walkFiles(root, relativePath) {
  const absolute = path.join(root, relativePath);
  if (!existsSync(absolute)) return [];
  const files = [];
  const stack = [absolute];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(target);
      else files.push(path.relative(root, target).replaceAll('\\', '/'));
    }
  }
  return files.sort();
}
function workspacePackages(root) {
  return publicPackageNames.filter((name) => existingPath(root, `packages/${name}/package.json`));
}
function componentIdFromFrameworkExport(exportName) { return /^\.\/([a-z][a-z0-9-]*)$/.exec(exportName)?.[1] ?? null; }
function componentIdFromWebExport(exportName) {
  const componentId = /^\.\/styles\/([a-z][a-z0-9-]*)\.css$/.exec(exportName)?.[1] ?? null;
  return componentId && !webFoundationStyleIds.has(componentId) ? componentId : null;
}
function frameworkComponentSourcePath(port, componentId) {
  return port === 'angular'
    ? `packages/angular/${componentId}/src/`
    : `packages/${port}/src/components/${componentId}/`;
}
function canonicalComponentSourcePath(root, canonicalRoot, port) {
  const candidate = `${canonicalRoot}/${port}/`;
  return existingPath(root, candidate.replace(/\/$/, '')) ? candidate : null;
}
function componentSourcePath(root, canonicalRoot, componentId, port) {
  return canonicalComponentSourcePath(root, canonicalRoot, port)
    ?? (port === 'web' ? `packages/web/src/components/${componentId}/` : frameworkComponentSourcePath(port, componentId));
}
function componentFacetPath(root, canonicalRoot, componentId, facet, { file = false } = {}) {
  const suffix = file ? facet : `${facet}/`;
  const canonical = `${canonicalRoot}/${suffix}`;
  if (existingPath(root, canonical.replace(/\/$/, ''))) return canonical;
  return `product/${componentId}/${suffix}`;
}
function findExampleManifests(root, canonicalRoot, componentId) {
  const examplesRoot = componentFacetPath(root, canonicalRoot, componentId, 'examples');
  return walkFiles(root, examplesRoot).filter((file) => file.endsWith('/example.json'));
}
function frameworkTopLevelModules(root, port) {
  const directory = path.join(root, `packages/${port}/src`);
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'components' || entry.name === 'internal' || entry.name.startsWith('_')) return [];
    if (entry.isDirectory()) return [entry.name];
    const extension = sourceExtensions.find((candidate) => entry.name.endsWith(candidate));
    if (!extension || entry.name === `index${extension}` || entry.name.endsWith('.d.ts')) return [];
    return [entry.name.slice(0, -extension.length)];
  }).sort();
}
function publicExportTarget(exportEntry) {
  if (typeof exportEntry === 'string') return exportEntry;
  if (!exportEntry || typeof exportEntry !== 'object') return null;
  for (const key of ['import', 'default', 'types']) if (typeof exportEntry[key] === 'string') return exportEntry[key];
  return Object.values(exportEntry).find((value) => typeof value === 'string') ?? null;
}
function publicUnitForSpecifier(root, specifier, packageManifests, ownedUnits) {
  for (const [packageName, manifest] of packageManifests) {
    const publicName = manifest?.name;
    if (!publicName) continue;
    const exportName = specifier === publicName ? '.' : specifier.startsWith(`${publicName}/`) ? `./${specifier.slice(publicName.length + 1)}` : null;
    if (!exportName) continue;
    const target = publicExportTarget(manifest.exports?.[exportName]);
    if (!target) return null;
    const sourceTarget = target.replace(/^\.\//, '').replace(/^dist\//, 'src/');
    const resolved = path.resolve(root, `packages/${packageName}`, sourceTarget);
    return ownedUnits.find((unit) => {
      const unitRoot = path.resolve(root, unit.sourcePath);
      return resolved === unitRoot || resolved.startsWith(`${unitRoot}${path.sep}`);
    }) ?? null;
  }
  return null;
}
function scanUnitDependencies(root, sourcePath, ownedUnits, packageManifests) {
  const dependencyNodes = new Set();
  const sourceFiles = walkFiles(root, sourcePath).filter((file) => sourceExtensions.some((ext) => file.endsWith(ext)));
  for (const file of sourceFiles) {
    const absolute = path.join(root, file);
    const source = readFileSync(absolute, 'utf8');
    const pattern = /(?:from\s+|import\s*)['"]([^'"]+)['"]/g;
    for (const match of source.matchAll(pattern)) {
      const specifier = match[1];
      if (specifier.startsWith('.')) {
        const resolved = path.resolve(path.dirname(absolute), specifier);
        for (const unit of ownedUnits) {
          const unitRoot = path.resolve(root, unit.sourcePath);
          if (resolved === unitRoot || resolved.startsWith(`${unitRoot}${path.sep}`)) dependencyNodes.add(unit.node);
        }
        continue;
      }
      const publicUnit = publicUnitForSpecifier(root, specifier, packageManifests, ownedUnits);
      if (publicUnit) dependencyNodes.add(publicUnit.node);
    }
  }
  return [...dependencyNodes].sort();
}
function discoverOwnedUnits(root, packageNames, packageManifests) {
  const units = [];
  for (const packageName of packageNames) for (const kind of ownedKinds) for (const id of directories(root, `packages/${packageName}/src/${kind}`)) {
    const sourcePath = `packages/${packageName}/src/${kind}/${id}/`;
    const testPath = `packages/${packageName}/test/${kind}/${id}/`;
    const metadataPath = `packages/${packageName}/changes/${kind}/${id}/`;
    units.push({ node: `unit:${packageName}:${kind}:${id}`, package: packageName, kind, id, sourcePath, testPath, metadataPath, evidenceFiles: walkFiles(root, testPath), dependencies: [] });
  }
  for (const unit of units) {
    const inferred = scanUnitDependencies(root, unit.sourcePath, units.filter((candidate) => candidate.node !== unit.node), packageManifests);
    const metadataFile = `${unit.sourcePath}dependencies.json`;
    const declared = existingPath(root, metadataFile) ? (readJson(root, metadataFile).dependsOn ?? []) : [];
    unit.dependencies = [...new Set([...inferred, ...declared])].sort();
  }
  return units;
}
export function discoverProductUnits(root = repoRoot) {
  const packageNames = workspacePackages(root);
  const packageManifests = new Map(packageNames.map((name) => [name, readJson(root, `packages/${name}/package.json`)]));
  const ownedUnits = discoverOwnedUnits(root, packageNames, packageManifests);
  const frameworkExports = new Map();
  const legacyProductIds = directories(root, 'product').filter((id) => !reservedProductRoots.has(id));
  const componentRoots = discoverComponentRoots(root);
  const discoveredIds = new Set([...legacyProductIds, ...componentRoots.keys()]);
  for (const port of frameworkPorts) {
    const exports = new Set(Object.keys(packageManifests.get(port)?.exports ?? {}).map(componentIdFromFrameworkExport).filter(Boolean));
    frameworkExports.set(port, exports);
    for (const id of exports) discoveredIds.add(id);
  }
  const webExports = new Set(Object.keys(packageManifests.get('web')?.exports ?? {}).map(componentIdFromWebExport).filter(Boolean));
  for (const id of webExports) discoveredIds.add(id);
  const components = [...discoveredIds].sort().map((componentId) => {
    const canonicalRoot = componentRoots.get(componentId)?.root ?? `product/components/${componentId}`;
    const ports = {};
    if (webExports.has(componentId)) {
      const sourcePath = componentSourcePath(root, canonicalRoot, componentId, 'web');
      const stylePaths = walkFiles(root, sourcePath).filter((file) => file.endsWith('.css'));
      ports.web = { paths: [sourcePath], stylePaths, browser: true, dependencies: scanUnitDependencies(root, sourcePath, ownedUnits, packageManifests) };
    }
    for (const port of frameworkPorts) {
      if (!frameworkExports.get(port)?.has(componentId)) continue;
      const sourcePath = componentSourcePath(root, canonicalRoot, componentId, port);
      ports[port] = { paths: [sourcePath, `packages/${port}/test/components/${componentId}/`], types: `packages/${port}/test/components/${componentId}/api.types.ts`, ...(ssrPorts.has(port) ? { ssr: `packages/${port}/test/components/${componentId}/ssr.test.mjs` } : {}), browser: true, dependencies: scanUnitDependencies(root, sourcePath, ownedUnits, packageManifests) };
    }
    const frameworkPortNamesForComponent = Object.keys(ports).filter((port) => port !== 'web');
    const legacyRoot = `product/${componentId}`;
    const componentRoot = existingPath(root, canonicalRoot) ? canonicalRoot : legacyRoot;
    const metadataPath = componentFacetPath(root, canonicalRoot, componentId, 'component.json', { file: true });
    const metadata = existingPath(root, metadataPath) ? readJson(root, metadataPath) : null;
    const docsRoot = componentFacetPath(root, canonicalRoot, componentId, 'docs');
    const documentationCandidates = [`${docsRoot}index.json`, `${docsRoot}index.html`];
    const documentationSources = documentationCandidates.filter((candidate) => existingPath(root, candidate));
    const examplesRoot = componentFacetPath(root, canonicalRoot, componentId, 'examples');
    const testRoot = componentFacetPath(root, canonicalRoot, componentId, 'test');
    const browserRoot = `${testRoot}browser`;
    const accessibilityPath = componentFacetPath(root, canonicalRoot, componentId, 'accessibility.json', { file: true });
    const changesRoot = componentFacetPath(root, canonicalRoot, componentId, 'changes');
    const conformanceRoot = `${testRoot}conformance`;
    return {
      component: componentId,
      status: 'implemented',
      root: `${componentRoot}/`,
      ports,
      metadataPath,
      documentationGroup: metadata?.group ?? metadata?.documentation?.group ?? null,
      documentationSource: documentationSources[0] ?? null,
      documentationSources,
      documentationCandidates,
      documentationPaths: [docsRoot, examplesRoot],
      exampleManifests: findExampleManifests(root, canonicalRoot, componentId),
      conformanceTypes: frameworkPortNamesForComponent.length > 1 ? `${conformanceRoot}/public-api.types.ts` : null,
      browser: { fixture: `${browserRoot}/fixtures.mjs`, tests: `${browserRoot}/tests/`, paths: [`${browserRoot}/`, accessibilityPath] },
      accessibilityPath,
      changesPath: changesRoot,
      changeFragments: walkFiles(root, changesRoot).filter((file) => file.endsWith('.md')),
      discovery: { webExport: webExports.has(componentId), frameworkExports: frameworkPortNamesForComponent, componentSlice: existingPath(root, canonicalRoot) || existingPath(root, legacyRoot) },
    };
  });
  return { packages: packageNames.map((name) => ({ name, manifest: packageManifests.get(name) })), components, ownedUnits, frameworkExports, webExports };
}
export function productPreparationProblems(root = repoRoot) {
  const discovery = discoverProductUnits(root);
  const problems = [];
  for (const port of frameworkPorts) {
    for (const moduleId of frameworkTopLevelModules(root, port)) problems.push(`packages/${port}/src/${moduleId} is an unclassified top-level source module; component implementations belong under ${port === 'angular' ? 'secondary entrypoint roots' : 'src/components/<id>/'} and internal modules belong under src/internal/ or use an _ prefix`);
    if (port !== 'angular') {
      for (const componentId of directories(root, `packages/${port}/src/components`)) if (!discovery.frameworkExports.get(port)?.has(componentId)) problems.push(`packages/${port}/src/components/${componentId}/ exists but @vyrnforge/${port} does not expose ./${componentId}`);
    }
  }
  for (const componentId of directories(root, 'packages/web/src/components')) if (!discovery.webExports.has(componentId)) problems.push(`packages/web/src/components/${componentId}/ exists but @vyrnforge/web does not expose ./styles/${componentId}.css`);
  for (const component of discovery.components) {
    if (!existingPath(root, component.root)) problems.push(`${component.component} is public but missing repository product ownership slice: ${component.root}`);
    if (!existingPath(root, component.metadataPath)) problems.push(`${component.component} is public but missing component-owned metadata: ${component.metadataPath}`);
    else if (!component.documentationGroup) problems.push(`${component.component} component metadata must declare documentation.group`);
    if (component.documentationSources.length === 0) problems.push(`${component.component} is public but missing component documentation: expected ${component.documentationCandidates.join(' or ')}`);
    else if (component.documentationSources.length > 1) problems.push(`${component.component} has competing primary component documentation sources: ${component.documentationSources.join(', ')}`);
    if (component.exampleManifests.length === 0) problems.push(`${component.component} is public but has no executable example.json under its product-owned examples facet`);
    for (const [port, config] of Object.entries(component.ports)) {
      const sourcePath = config.paths[0];
      if (!existingPath(root, sourcePath.replace(/\/$/, ''))) problems.push(`${component.component}/${port} public surface is missing authoring source: ${sourcePath}`);
      if (config.types && !existingPath(root, config.types)) problems.push(`${component.component}/${port} is public but missing package-local type evidence: ${config.types}`);
      if (config.ssr && !existingPath(root, config.ssr)) problems.push(`${component.component}/${port} is public but missing package-local SSR evidence: ${config.ssr}`);
    }
    if (component.conformanceTypes && !existingPath(root, component.conformanceTypes)) problems.push(`${component.component} has multiple framework ports but is missing cross-port type conformance: ${component.conformanceTypes}`);
    for (const browserPath of [component.browser.fixture, component.browser.tests]) if (!existingPath(root, browserPath.replace(/\/$/, ''))) problems.push(`${component.component} is public but missing shared browser evidence preparation: ${browserPath}`);
  }
  for (const unit of discovery.ownedUnits) {
    if (!existingPath(root, unit.testPath.replace(/\/$/, '')) || unit.evidenceFiles.length === 0) problems.push(`${unit.node} is a scoped product unit but has no mirrored evidence under ${unit.testPath}`);
    for (const dependency of unit.dependencies) if (!discovery.ownedUnits.some((candidate) => candidate.node === dependency)) problems.push(`${unit.node} declares unknown dependency ${dependency}`);
  }
  return problems;
}
export function assertProductPreparation(root = repoRoot) { const problems = productPreparationProblems(root); if (problems.length) throw new Error(`Product-unit preparation failed:\n- ${problems.join('\n- ')}`); return discoverProductUnits(root); }
