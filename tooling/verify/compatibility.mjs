import { readFile } from 'node:fs/promises';

const root = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
const support = JSON.parse(await readFile(new URL('../testing/compatibility/support-status.json', import.meta.url), 'utf8'));
const baselineStatus = 'selected-validation-baseline';
const frameworkFields = new Map([
  ['react', new Set(['baseline', 'status'])],
  ['angular', new Set(['baseline', 'typescript', 'status'])],
  ['vue', new Set(['baseline', 'status'])],
  ['elements', new Set(['baseline', 'status'])],
  ['native-web', new Set(['baseline', 'status'])],
]);

if (support.schemaVersion !== 2) throw new Error('compatibility metadata schemaVersion must be 2');
if (support.status !== baselineStatus) throw new Error(`compatibility metadata status must be ${baselineStatus}`);
if (support.runtime?.node !== root.engines.node || support.runtime?.pnpm !== root.engines.pnpm) {
  throw new Error('root engines and compatibility runtime metadata must match');
}
if (support.authoring?.typescriptPinned !== root.devDependencies.typescript) {
  throw new Error('compatibility TypeScript baseline must match the pinned root compiler');
}
if (support.authoring?.eslint !== root.devDependencies.eslint) {
  throw new Error('compatibility ESLint baseline must match the pinned root toolchain');
}
if (support.authoring?.typescriptEslint !== root.devDependencies['typescript-eslint']) {
  throw new Error('compatibility TypeScript ESLint baseline must match the pinned root toolchain');
}

const actualFrameworks = Object.keys(support.frameworks ?? {}).sort();
const expectedFrameworks = [...frameworkFields.keys()].sort();
if (JSON.stringify(actualFrameworks) !== JSON.stringify(expectedFrameworks)) {
  throw new Error(`compatibility framework environments must be exactly ${expectedFrameworks.join(', ')}`);
}
for (const [framework, allowedFields] of frameworkFields) {
  const entry = support.frameworks[framework];
  if (!entry?.baseline) throw new Error(`${framework} compatibility metadata must define a baseline`);
  if (entry.status !== baselineStatus) throw new Error(`${framework} compatibility metadata status must describe only the selected validation baseline`);
  const unexpectedFields = Object.keys(entry).filter((field) => !allowedFields.has(field));
  if (unexpectedFields.length) {
    throw new Error(`${framework} compatibility metadata contains non-environment fields: ${unexpectedFields.join(', ')}; component implementation and maturity belong to product-owned evidence`);
  }
}

if (support.browsers?.playwright !== root.devDependencies['@playwright/test']) {
  throw new Error('browser validation baseline must match the pinned Playwright toolchain');
}
for (const engine of ['chromium', 'firefox', 'webkit']) {
  if (!support.browsers?.[engine]) throw new Error(`browser validation baseline is missing ${engine}`);
}
if (support.browsers?.status !== baselineStatus) throw new Error('browser compatibility metadata status must describe only the selected validation baseline');
if (support.ssrBundlers?.status !== baselineStatus || !support.ssrBundlers?.policy) {
  throw new Error('SSR/bundler compatibility metadata must expose only the selected validation baseline and its environment policy');
}
process.stdout.write('compatibility metadata: environment baselines are internally consistent and contain no component registry\n');
