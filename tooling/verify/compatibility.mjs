import { readFile } from 'node:fs/promises';

const root = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
const support = JSON.parse(await readFile(new URL('../compatibility/support-status.json', import.meta.url), 'utf8'));

if (support.schemaVersion !== 2) throw new Error('compatibility metadata schemaVersion must be 2');
if (support.status !== 'implementation-baseline') throw new Error('compatibility metadata must expose an implementation baseline during component rollout');
if (support.runtime.node !== root.engines.node || support.runtime.npm !== root.engines.npm) throw new Error('root engines and compatibility runtime metadata must match');
if (support.authoring?.typescriptPinned !== root.devDependencies.typescript) throw new Error('compatibility TypeScript baseline must match the pinned root compiler');
if (support.authoring?.typescriptEslint !== root.devDependencies['typescript-eslint']) throw new Error('compatibility TypeScript ESLint baseline must match the pinned root toolchain');

for (const framework of ['react', 'angular', 'vue']) {
  const entry = support.frameworks?.[framework];
  if (!entry?.baseline || entry.status !== 'representative-components-implemented') throw new Error(`${framework} must identify the implemented Button, Tabs, and Dialog proof-component baseline without implying release support`);
}
const elements = support.frameworks?.elements;
if (!elements?.baseline || elements.status !== 'tabs-baseline-implemented' || elements.button !== 'deferred-native-semantics' || elements.tabs !== 'implemented') {
  throw new Error('Elements must identify its implemented Tabs baseline while preserving the deliberate native Button deferral');
}
if (support.frameworks?.['native-web']?.status !== 'representative-components-implemented') throw new Error('Native Web must identify the implemented representative-component baseline');
if (support.browsers?.playwright !== root.devDependencies['@playwright/test']) throw new Error('browser validation baseline must match the pinned Playwright toolchain');
for (const engine of ['chromium', 'firefox', 'webkit']) if (!support.browsers?.[engine]) throw new Error(`browser validation baseline is missing ${engine}`);
if (support.ssrBundlers?.status !== 'representative-port-validation-active') throw new Error('SSR/bundler compatibility must identify representative framework-port validation once the proof components exist');

process.stdout.write('compatibility metadata: ok\n');
