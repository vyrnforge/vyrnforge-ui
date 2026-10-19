import { readFile } from 'node:fs/promises';

const root = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
const support = JSON.parse(await readFile(new URL('../compatibility/support-status.json', import.meta.url), 'utf8'));

if (support.schemaVersion !== 2) throw new Error('compatibility metadata schemaVersion must be 2');
if (support.status !== 'implementation-baseline') throw new Error('compatibility metadata must expose an implementation baseline before component work');
if (support.runtime.node !== root.engines.node || support.runtime.npm !== root.engines.npm) {
  throw new Error('root engines and compatibility runtime metadata must match');
}
if (support.authoring?.typescriptPinned !== root.devDependencies.typescript) {
  throw new Error('compatibility TypeScript baseline must match the pinned root compiler');
}
if (support.authoring?.typescriptEslint !== root.devDependencies['typescript-eslint']) {
  throw new Error('compatibility TypeScript ESLint baseline must match the pinned root toolchain');
}
for (const framework of ['react', 'angular', 'vue']) {
  const entry = support.frameworks?.[framework];
  if (!entry?.baseline || entry.status !== 'selected-not-implemented') {
    throw new Error(`${framework} must have a selected implementation baseline without being represented as shipped`);
  }
}
if (support.frameworks?.elements?.status !== 'selected-not-implemented') {
  throw new Error('Elements baseline must remain selected-not-implemented until the port exists');
}
if (support.frameworks?.['native-web']?.status !== 'selected-foundation') {
  throw new Error('Native Web must be represented as the selected foundation surface');
}
if (support.browsers?.playwright !== root.devDependencies['@playwright/test']) {
  throw new Error('browser validation baseline must match the pinned Playwright toolchain');
}
for (const engine of ['chromium', 'firefox', 'webkit']) {
  if (!support.browsers?.[engine]) throw new Error(`browser validation baseline is missing ${engine}`);
}
if (support.ssrBundlers?.status !== 'deferred-until-framework-ports') {
  throw new Error('SSR/bundler compatibility must remain framework-owned until real ports exist');
}

process.stdout.write('compatibility metadata: ok\n');
