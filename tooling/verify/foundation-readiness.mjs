import { readFile } from 'node:fs/promises';
import { renderRuntimeTokens } from '../tokens/render.mjs';
import { referenceTokens } from '../tokens/source.mjs';

const root = JSON.parse(await readFile('package.json', 'utf8'));
const support = JSON.parse(await readFile('tooling/testing/compatibility/support-status.json', 'utf8'));
const impact = JSON.parse(await readFile('tooling/impact/config.json', 'utf8'));
const browserQualification = JSON.parse(await readFile('tooling/testing/compatibility/foundation-browser-qualification.json', 'utf8'));
const visualBaseline = JSON.parse(await readFile('tooling/testing/visual/foundation-baseline.json', 'utf8'));
const webManifest = JSON.parse(await readFile('packages/web/package.json', 'utf8'));

const packages = ['core', 'web', 'icons', 'react', 'angular', 'vue', 'elements'];
for (const name of packages) {
  const script = `lint:${name}`;
  if (!root.scripts?.[script]) throw new Error(`Missing scoped TypeScript lint script: ${script}`);
  const scope = `lint-${name}`;
  if (!impact.scopeOrder?.includes(scope)) throw new Error(`Impact metadata is missing scoped lint evidence: ${scope}`);
}

if (root.scripts?.['generate:tokens'] !== 'node tooling/tokens/generate.mjs --write') throw new Error('Token authoring must expose the canonical generation command');
if (root.scripts?.['verify:tokens'] !== 'node tooling/tokens/generate.mjs --check') throw new Error('Token authoring must expose the canonical drift check');
if (root.scripts?.['test:visual:foundation'] !== 'node tooling/testing/visual/run-foundation.mjs') throw new Error('Foundation visual regression must expose the canonical test command');
for (const category of ['color', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'space', 'radius', 'shadow', 'motion', 'breakpoint']) {
  if (!referenceTokens[category] || Object.keys(referenceTokens[category]).length === 0) throw new Error(`Reference token authoring is missing the L0 design category: ${category}`);
}
const tokensCss = await readFile('packages/web/src/styles/tokens.css', 'utf8');
if (tokensCss !== renderRuntimeTokens()) throw new Error('Runtime token CSS has drifted from the repository-owned token source');
for (const token of ['--vf-shadow-sm', '--vf-shadow-md', '--vf-shadow-lg', '--vf-motion-easing-standard']) {
  if (!tokensCss.includes(token)) throw new Error(`Runtime token CSS is missing required L0 public token: ${token}`);
}
if (tokensCss.includes('--vf-breakpoint-')) throw new Error('Breakpoint authoring tokens must remain static/build-time values rather than runtime CSS variables');

const requiredCssExports = {
  './styles.css': './dist/styles.css',
  './styles/tokens.css': './dist/styles/tokens.css',
  './styles/foundation.css': './dist/styles/foundation.css',
  './styles/reset.css': './dist/styles/reset.css',
};
for (const [entrypoint, target] of Object.entries(requiredCssExports)) {
  if (webManifest.exports?.[entrypoint] !== target) throw new Error(`@vyrnforge/web is missing canonical CSS export ${entrypoint}`);
}
const aggregateCss = await readFile('packages/web/src/styles.css', 'utf8');
if (!aggregateCss.includes('@import "./styles/foundation.css";')) throw new Error('Aggregate Web CSS must include the shared foundation stylesheet');
if (aggregateCss.includes('@import "./styles/reset.css";')) throw new Error('The optional reset must not be included by the aggregate stylesheet');
const foundationCss = await readFile('packages/web/src/styles/foundation.css', 'utf8');
if (!foundationCss.includes('[data-vf-visually-hidden]')) throw new Error('Foundation CSS must provide the shared visually-hidden contract');
if (!foundationCss.includes('prefers-reduced-motion: reduce')) throw new Error('Foundation CSS must provide reduced-motion plumbing');
await readFile('packages/web/src/styles/reset.css', 'utf8');

if (!impact.scopeOrder?.includes('browser-foundation-visual')) throw new Error('Foundation visual regression evidence is missing from impact validation');
if (!impact.tiers?.main?.includes('browser-foundation-visual') || !impact.tiers?.scheduled?.includes('browser-foundation-visual') || !impact.tiers?.release?.includes('browser-foundation-visual')) {
  throw new Error('Foundation visual regression must be required by main, scheduled, and release validation tiers');
}
if (visualBaseline.schemaVersion !== 1 || visualBaseline.browser !== 'chromium' || visualBaseline.playwright !== root.devDependencies?.['@playwright/test']) {
  throw new Error('Foundation visual baseline metadata does not match the selected browser toolchain');
}
if (visualBaseline.fixture !== 'foundation-design-language-v1') throw new Error('Foundation visual baseline fixture identity has drifted');
if (!/^[a-f0-9]{64}$/.test(visualBaseline.sha256)) throw new Error('Foundation visual baseline must contain a committed SHA-256 digest');

for (const file of ['documentation/shared/migration.html', 'documentation/shared/diagnostics.html', 'documentation/shared/developer-support.html', 'CONTRIBUTING.md']) {
  await readFile(file, 'utf8');
}

if (root.devDependencies?.typescript !== '6.0.3') throw new Error('Foundation authoring compiler must remain pinned to TypeScript 6.0.3 until compatibility is deliberately revised');
if (root.devDependencies?.['typescript-eslint'] !== '8.71.2') throw new Error('Foundation TypeScript lint tooling must remain pinned until deliberately revised');
if (support.schemaVersion !== 2 || support.status !== 'implementation-baseline') throw new Error('Compatibility metadata must expose the selected implementation baseline');

const serializedSupport = JSON.stringify(support);
for (const placeholder of ['not-yet-selected', 'platform-surface-not-yet-versioned']) {
  if (serializedSupport.includes(placeholder)) throw new Error(`Compatibility metadata still contains unresolved placeholder: ${placeholder}`);
}

for (const framework of ['react', 'angular', 'vue']) {
  const value = support.frameworks?.[framework];
  if (!value || typeof value !== 'object' || !value.baseline || !value.status) {
    throw new Error(`Compatibility baseline is incomplete for ${framework}`);
  }
}

if (support.browsers?.playwright !== root.devDependencies?.['@playwright/test']) {
  throw new Error('Browser validation baseline must match the pinned Playwright toolchain');
}

if (browserQualification.schemaVersion !== 1 || browserQualification.qualificationType !== 'pre-component-foundation') {
  throw new Error('Foundation browser qualification evidence is missing or has the wrong evidence type');
}
if (browserQualification.result !== 'passed' || browserQualification.releaseQualification !== false) {
  throw new Error('Foundation browser evidence must be a passing non-release qualification');
}
if (!Number.isInteger(browserQualification.workflowRunId) || !Number.isInteger(browserQualification.jobId)) {
  throw new Error('Foundation browser qualification must reference the successful workflow run and job');
}
for (const engine of ['chromium', 'firefox', 'webkit']) {
  if (!browserQualification.engines?.includes(engine)) throw new Error(`Foundation browser qualification is missing ${engine}`);
}
if (browserQualification.playwright !== support.browsers?.playwright) {
  throw new Error('Foundation browser qualification must match the selected Playwright baseline');
}

process.stdout.write('foundation readiness: literal L0 architecture baseline ok\n');
