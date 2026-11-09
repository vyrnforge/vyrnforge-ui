import { access, readFile } from 'node:fs/promises';
import { discoverProductGraph } from '../product/discover-product-graph.mjs';
import {
  allowedInternalDependencies,
  frameworkPortNames,
  publicPackageNames,
} from './public-package-model.mjs';

const root = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
const productGraph = discoverProductGraph();
const packageManifests = new Map(productGraph.packages.map((pkg) => [pkg.id, pkg.manifest]));
const publishMarkers = ['changeset publish', 'npm publish', 'pnpm publish'];

function flattenExportTargets(value, targets = []) {
  if (typeof value === 'string') targets.push(value);
  else if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) flattenExportTargets(nested, targets);
  }
  return targets;
}

function assertPrivateRebuildManifest(manifest, label) {
  if (manifest.private !== true) throw new Error(`${label} must remain private during the rebuild`);
  for (const [script, command] of Object.entries(manifest.scripts ?? {})) {
    if (publishMarkers.some((marker) => command.includes(marker))) {
      throw new Error(`${label} script ${script} must not publish while the rebuild is private`);
    }
  }
}

assertPrivateRebuildManifest(root, 'root package');
for (const name of publicPackageNames) {
  const manifest = packageManifests.get(name);
  if (!manifest) throw new Error(`Product Graph is missing public package ${name}`);
  assertPrivateRebuildManifest(manifest, manifest.name);
  if (manifest.type !== 'module') throw new Error(`${manifest.name} must be ESM`);
  if (JSON.stringify(manifest.files) !== JSON.stringify(['dist'])) {
    throw new Error(`${manifest.name} must publish only dist`);
  }
  for (const [field, target] of [
    ['main', manifest.main],
    ['types', manifest.types],
  ]) {
    if (typeof target !== 'string' || !target.startsWith('./dist/')) {
      throw new Error(`${manifest.name} ${field} must resolve to a built dist artifact`);
    }
  }
  const targets = flattenExportTargets(manifest.exports);
  if (targets.length === 0 || targets.some((target) => !target.startsWith('./dist/'))) {
    throw new Error(`${manifest.name} exports must expose only built dist artifacts`);
  }
  if (targets.some((target) => target.includes('/src/') || target.includes('/internal/'))) {
    throw new Error(`${manifest.name} exposes an internal source path`);
  }
  const declared = Object.keys(manifest.dependencies ?? {})
    .filter((dependency) => dependency.startsWith('@vyrnforge/'))
    .sort();
  const expected = [...allowedInternalDependencies[name]].sort();
  if (JSON.stringify(declared) !== JSON.stringify(expected)) {
    throw new Error(`${manifest.name} internal dependencies must be ${expected.join(', ') || '<none>'}`);
  }
  await access(new URL(`../../packages/${name}/tsconfig.json`, import.meta.url));
}

const web = packageManifests.get('web');
if (JSON.stringify(web.sideEffects) !== JSON.stringify(['./dist/**/*.css'])) {
  throw new Error('@vyrnforge/web CSS assets must be declared as side effects');
}
if (web.exports?.['./styles.css'] !== './dist/styles.css') {
  throw new Error('@vyrnforge/web must expose the canonical stylesheet explicitly');
}

const icons = packageManifests.get('icons');
if (icons.sideEffects !== false) throw new Error('@vyrnforge/icons must remain side-effect-free');

for (const port of frameworkPortNames) {
  const manifest = packageManifests.get(port);
  if (Object.keys(manifest.dependencies ?? {}).includes('@vyrnforge/icons')) {
    throw new Error(`${manifest.name} must not depend on the optional icon catalog`);
  }
}

let projectedFoundationSurfaces = 0;
for (const unit of productGraph.units.filter((candidate) => candidate.kind === 'foundation')) {
  const webSurface = unit.surfaces?.web;
  if (!webSurface?.publicEntrypoints.length) continue;
  projectedFoundationSurfaces += 1;
  if (
    web.exports?.[`./styles/${unit.unitId}.css`] !==
    `./dist/foundations/${unit.unitId}/${unit.unitId}.css`
  ) {
    throw new Error(`@vyrnforge/web ${unit.unitId} foundation stylesheet export must target its foundation bundle`);
  }
}

let projectedComponentSurfaces = 0;
for (const component of productGraph.components) {
  const componentId = component.unitId;
  const webSurface = component.surfaces.web;
  if (webSurface?.publicEntrypoints.length) {
    projectedComponentSurfaces += 1;
    if (
      web.exports?.[`./styles/${componentId}.css`] !==
      `./dist/components/${componentId}/${componentId}.css`
    ) {
      throw new Error(`@vyrnforge/web ${componentId} stylesheet export must target its component bundle`);
    }
  }

  for (const port of frameworkPortNames) {
    const surface = component.surfaces[port];
    if (!surface?.publicEntrypoints.length) continue;
    projectedComponentSurfaces += 1;
    const manifest = packageManifests.get(port);
    const entry = manifest.exports?.[`./${componentId}`];
    if (!entry) throw new Error(`@vyrnforge/${port} must expose ${componentId}`);
    const targets = flattenExportTargets(entry);
    if (port === 'angular') {
      const artifactStem = `vyrnforge-angular-${componentId}`;
      if (
        !targets.every((target) => target.startsWith('./dist/')) ||
        !targets.some((target) => target.includes(artifactStem))
      ) {
        throw new Error(`@vyrnforge/angular/${componentId} must resolve to its APF secondary entrypoint`);
      }
      continue;
    }
    if (targets.some((target) => !target.startsWith(`./dist/components/${componentId}/`))) {
      throw new Error(`@vyrnforge/${port}/${componentId} must build from its component-owned output directory`);
    }
  }
}

process.stdout.write(
  `package contracts: ${publicPackageNames.length} private rebuild packages, ${projectedFoundationSurfaces} foundation projection(s), and ${projectedComponentSurfaces} component projections ok\n`,
);
