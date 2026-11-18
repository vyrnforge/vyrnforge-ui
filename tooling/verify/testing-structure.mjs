import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { assertProductPreparation } from '../testing/discover-product-units.mjs';
import { loadBrowserFixtureModule, validateBrowserFixtureModule } from '../testing/browser-fixtures.mjs';
import { createSemanticImpact } from '../impact/plan.mjs';
import { frameworkPortNames } from '../package-model.mjs';

for (const file of ['tooling/testing/README.md', 'tooling/impact/README.md', 'tooling/impact/plan.mjs', 'tooling/README.md']) await access(file);

// The full check runs tooling Vitest once through Nx; guard suites that the
// previous standalone verify:* commands also required to be non-empty.
for (const owner of ['product', 'impact', 'validation']) {
  const entries = await readdir(path.join('tooling', owner), { withFileTypes: true });
  if (!entries.some((entry) => entry.isFile() && entry.name.endsWith('.test.mjs'))) {
    throw new Error(`repository-tooling tests missing for ${owner}; full check must not silently omit this verification owner`);
  }
}
const toolingProject = JSON.parse(await readFile('tooling/project.json', 'utf8'));
if (!toolingProject.targets?.test?.options?.command?.includes('vitest run --project repository-tooling')) {
  throw new Error('repository-tooling:test must run the shared Vitest tooling project through Nx');
}

// Cross-port public-api.types.ts files are product-owned type evidence. Their
// existence or ESLint coverage alone must not be mistaken for a TypeScript pass.
const conformanceProject = JSON.parse(await readFile('product/project.json', 'utf8'));
const conformanceTarget = conformanceProject.targets?.typecheck;
if (conformanceTarget?.options?.command !== 'pnpm exec tsc -p product/tsconfig.conformance.json') {
  throw new Error('product-conformance:typecheck must compile the cross-port API conformance files');
}
const builtConformanceDependencies = new Set((conformanceTarget.dependsOn ?? [])
  .filter((dependency) => dependency.target === 'build')
  .flatMap((dependency) => dependency.projects ?? []));
for (const port of [...frameworkPortNames, 'icons']) {
  if (!builtConformanceDependencies.has(`@vyrnforge/${port}`)) {
    throw new Error(`product conformance typecheck must build its public ${port} dependency first`);
  }
}
const conformanceConfig = JSON.parse(await readFile('product/tsconfig.conformance.json', 'utf8'));
if (conformanceConfig.compilerOptions?.noEmit !== true ||
    conformanceConfig.compilerOptions?.module !== 'ESNext' ||
    conformanceConfig.compilerOptions?.moduleResolution !== 'Bundler' ||
    conformanceConfig.compilerOptions?.moduleDetection !== 'force' ||
    !conformanceConfig.include?.includes('components/**/test/conformance/public-api.types.ts')) {
  throw new Error('cross-port conformance must typecheck all component-owned public API type assertions');
}

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