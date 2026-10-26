import { readFile } from 'node:fs/promises';

const root = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
const support = JSON.parse(await readFile(new URL('../testing/compatibility/support-status.json', import.meta.url), 'utf8'));

if (support.schemaVersion !== 2) throw new Error('compatibility metadata schemaVersion must be 2');
if (!support.status || typeof support.status !== 'string') throw new Error('compatibility metadata must expose a status');
if (support.runtime?.node !== root.engines.node || support.runtime?.npm !== root.engines.npm) {
  throw new Error('root engines and compatibility runtime metadata must match');
}
if (support.authoring?.typescriptPinned !== root.devDependencies.typescript) {
  throw new Error('compatibility TypeScript baseline must match the pinned root compiler');
}
if (support.authoring?.typescriptEslint !== root.devDependencies['typescript-eslint']) {
  throw new Error('compatibility TypeScript ESLint baseline must match the pinned root toolchain');
}
for (const framework of ['react', 'angular', 'vue', 'elements', 'native-web']) {
  const entry = support.frameworks?.[framework];
  if (!entry?.baseline || !entry?.status) throw new Error(`${framework} compatibility metadata must define baseline and status`);
}
if (support.browsers?.playwright !== root.devDependencies['@playwright/test']) {
  throw new Error('browser validation baseline must match the pinned Playwright toolchain');
}
for (const engine of ['chromium', 'firefox', 'webkit']) {
  if (!support.browsers?.[engine]) throw new Error(`browser validation baseline is missing ${engine}`);
}
if (!support.browsers?.status) throw new Error('browser compatibility metadata must expose a status');
if (!support.ssrBundlers?.status || !support.ssrBundlers?.policy) {
  throw new Error('SSR/bundler compatibility metadata must expose status and policy');
}
process.stdout.write('compatibility metadata: internally consistent\n');
