import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { discoverProductUnits } from './discover-product-units.mjs';
import { loadBrowserFixtureModule, prepareBrowserFixture } from './browser-fixtures.mjs';

const port = process.argv[2] ?? 'web';
const root = process.cwd();
const { components } = discoverProductUnits(root);

let fixtureModules = 0;
let generatedPages = 0;
let skippedUnsupported = 0;

for (const component of components) {
  const fixturePath = path.join(root, component.browser.fixture);
  if (!existsSync(fixturePath)) continue;
  const fixtureModule = await loadBrowserFixtureModule(fixturePath);

  fixtureModules += 1;
  const generated = await prepareBrowserFixture({ root, fixturePath, fixtureModule, port });
  if (generated) generatedPages += 1;
  else skippedUnsupported += 1;
}

if (fixtureModules === 0 || generatedPages === 0) {
  throw new Error(
    `No browser fixture modules generated pages for "${port}" (modules=${fixtureModules}, skipped=${skippedUnsupported}).`,
  );
}

console.log(
  `Prepared ${generatedPages} "${port}" browser fixture page(s) from ${fixtureModules} product fixture module(s).`,
);
