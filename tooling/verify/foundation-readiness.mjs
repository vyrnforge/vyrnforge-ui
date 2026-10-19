import { readFile } from 'node:fs/promises';

const root = JSON.parse(await readFile('package.json', 'utf8'));
const support = JSON.parse(await readFile('tooling/compatibility/support-status.json', 'utf8'));
const validation = JSON.parse(await readFile('tooling/impact/validation-graph.json', 'utf8'));
const browserQualification = JSON.parse(await readFile('tooling/compatibility/foundation-browser-qualification.json', 'utf8'));

const packages = ['core', 'web', 'react', 'angular', 'vue', 'elements'];
for (const name of packages) {
  const script = `lint:${name}`;
  if (!root.scripts?.[script]) throw new Error(`Missing scoped TypeScript lint script: ${script}`);
  const scope = `lint-${name}`;
  if (!validation.scopeOrder?.includes(scope)) throw new Error(`Validation graph is missing scoped lint evidence: ${scope}`);
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

process.stdout.write('foundation readiness: ok\n');
