import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { browserPortNames } from '../package-model.mjs';
import { discoverProductGraph } from '../product/discover-product-graph.mjs';
import { loadBrowserFixtureModule, prepareBrowserFixture, validateBrowserFixtureModule } from './browser-fixtures.mjs';
import { resolveBrowserFixtureScope } from './browser-fixture-scope.mjs';

const port = process.env.VF_COMPONENT_PORT ?? process.argv[2] ?? 'web';
const selectedComponents = new Set(
  (process.env.VF_COMPONENTS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
);
const supportedPorts = new Set(browserPortNames);
if (!supportedPorts.has(port)) throw new Error(`Unsupported VyrnForge browser port: ${port}`);

const root = process.cwd();
const outputRoot = path.join(root, 'dist/browser-fixtures');
rmSync(outputRoot, { recursive: true, force: true });

const graph = discoverProductGraph(root);
const components = [...graph.components, ...graph.patterns];
const unknownComponents = [...selectedComponents].filter(
  (componentId) => !components.some((component) => component.unitId === componentId),
);
if (unknownComponents.length) {
  throw new Error(`Unknown VyrnForge browser component scope: ${unknownComponents.join(', ')}`);
}

let fixtureModules = 0;
let generatedPages = 0;
let skippedUnsupported = 0;
let skippedUnselected = 0;

const entries = new Map();
const roots = [];
for (const component of components) {
  const fixtureRelativePath = component.facets.test
    ? `${component.facets.test}browser/fixtures.mjs`
    : null;
  if (!fixtureRelativePath) continue;
  const fixturePath = path.join(root, fixtureRelativePath);
  if (!existsSync(fixturePath)) continue;
  if (component.surfaces[port]) entries.set(component.unitId, { component, fixturePath });

  if (selectedComponents.size > 0 && !selectedComponents.has(component.unitId)) {
    skippedUnselected += 1;
    continue;
  }
  if (!component.surfaces[port]) {
    skippedUnsupported += 1;
    continue;
  }
  roots.push(component.unitId);
}

const scope = await resolveBrowserFixtureScope({
  roots,
  port,
  load: async (id) => {
    const entry = entries.get(id);
    if (!entry) return undefined;
    const fixtureModule = await loadBrowserFixtureModule(entry.fixturePath);
    const definition = validateBrowserFixtureModule({
      fixturePath: entry.fixturePath,
      fixtureModule,
      component: id,
    });
    return { ...entry, fixtureModule, definition };
  },
});

for (const { component, fixturePath, fixtureModule } of scope) {
  fixtureModules += 1;
  const generated = await prepareBrowserFixture({
    root,
    fixturePath,
    fixtureModule,
    port,
    component: component.unitId,
  });
  if (generated) generatedPages += 1;
  else skippedUnsupported += 1;
}

if (fixtureModules === 0 || generatedPages === 0) {
  throw new Error(
    `No browser fixture modules generated pages for "${port}" ` +
    `(selected=${selectedComponents.size || 'all'}, modules=${fixtureModules}, ` +
    `unsupported=${skippedUnsupported}, unselected=${skippedUnselected}).`,
  );
}

console.log(
  `Prepared ${generatedPages} "${port}" browser fixture page(s) from ${fixtureModules} product fixture module(s) (including dependencies); ` +
    `skipped ${skippedUnsupported} unsupported and ${skippedUnselected} unselected root fixture(s).`,
);
