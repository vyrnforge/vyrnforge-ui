import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { browserPortNames } from '../package-model.mjs';
import { discoverProductUnits } from './discover-product-units.mjs';
import { loadBrowserFixtureModule, prepareBrowserFixture } from './browser-fixtures.mjs';

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

const { components } = discoverProductUnits(root);
const unknownComponents = [...selectedComponents].filter(
  (componentId) => !components.some((component) => component.component === componentId),
);
if (unknownComponents.length) {
  throw new Error(`Unknown VyrnForge browser component scope: ${unknownComponents.join(', ')}`);
}

let fixtureModules = 0;
let generatedPages = 0;
let skippedUnsupported = 0;
let skippedUnselected = 0;

for (const component of components) {
  if (selectedComponents.size > 0 && !selectedComponents.has(component.component)) {
    skippedUnselected += 1;
    continue;
  }

  const fixturePath = path.join(root, component.browser.fixture);
  if (!existsSync(fixturePath)) continue;

  fixtureModules += 1;
  if (!component.ports[port]) {
    skippedUnsupported += 1;
    continue;
  }

  const fixtureModule = await loadBrowserFixtureModule(fixturePath);
  const generated = await prepareBrowserFixture({
    root,
    fixturePath,
    fixtureModule,
    port,
    component: component.component,
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
  `Prepared ${generatedPages} "${port}" browser fixture page(s) from ${fixtureModules} selected product fixture module(s); ` +
    `skipped ${skippedUnsupported} unsupported and ${skippedUnselected} unselected fixture(s).`,
);
