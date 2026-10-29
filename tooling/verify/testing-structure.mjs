import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { assertProductPreparation } from '../testing/discover-product-units.mjs';
import { loadBrowserFixtureModule, validateBrowserFixtureModule } from '../testing/browser-fixtures.mjs';
import { createSemanticImpact } from '../impact/plan.mjs';

for (const file of ['tooling/testing/README.md', 'tooling/impact/README.md', 'tooling/impact/plan.mjs', 'tooling/README.md']) await access(file);

const impact = createSemanticImpact(['nx.json', 'tooling/verify/package-artifacts.mjs']);
if (impact.orchestration !== 'nx') throw new Error('Nx must remain the only task orchestrator');
if (!impact.repositoryWide || !impact.semanticEvidence.includes('package-artifacts') || !impact.semanticEvidence.includes('browser')) {
  throw new Error('semantic impact classification must retain repository-wide package and browser evidence');
}

async function collectBrowserSpecs(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectBrowserSpecs(target));
    else if (entry.isFile() && /\.spec\.mjs$/.test(entry.name) && target.includes(`${path.sep}test${path.sep}browser${path.sep}tests${path.sep}`)) files.push(target);
  }
  return files;
}

const legacyAxePatterns = [
  /axeCore\.source/,
  /globalThis\.axe(?:\.|\b)/,
  /page\.addScriptTag\(\{\s*content:\s*axeCore/,
];
const legacyAxeFiles = [];
for (const file of await collectBrowserSpecs('product')) {
  const source = await readFile(file, 'utf8');
  if (legacyAxePatterns.some((pattern) => pattern.test(source))) legacyAxeFiles.push(file.split(path.sep).join('/'));
}
if (legacyAxeFiles.length) {
  throw new Error(`legacy raw axe injection remains in browser evidence:\n${legacyAxeFiles.map((file) => `- ${file}`).join('\n')}\nUse @axe-core/playwright through browser-owned test code instead.`);
}

const discovery = assertProductPreparation();
const invalidFixtureSources = [];
for (const component of discovery.components) {
  const fixturePath = path.resolve(component.browser.fixture);
  const source = await readFile(fixturePath, 'utf8');
  if (/process\.argv\s*\[\s*2\s*\]/.test(source) || /(?:node:)?child_process/.test(source)) {
    invalidFixtureSources.push(component.browser.fixture);
    continue;
  }
  const fixtureModule = await loadBrowserFixtureModule(fixturePath);
  validateBrowserFixtureModule({
    fixturePath: component.browser.fixture,
    fixtureModule,
    component: component.component,
  });
}
if (invalidFixtureSources.length) {
  throw new Error(`browser fixture modules must use the explicit in-process contract without argv or child-process preparation:\n${invalidFixtureSources.map((file) => `- ${file}`).join('\n')}`);
}

process.stdout.write(`testing structure: ${discovery.components.length} product components and ${discovery.ownedUnits.length} reusable scoped units prepared; repository testing infrastructure and Nx-owned impact classification are structurally valid\n`);