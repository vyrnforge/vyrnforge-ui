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
  if (!entry?.baseline || entry.status !== 'button-baseline-implemented') throw new Error(`${framework} must identify the implemented Button baseline without implying the whole framework port is complete`);
}
if (support.frameworks?.elements?.status !== 'selected-not-implemented' || support.frameworks?.elements?.button !== 'deferred-native-semantics') throw new Error('Elements Button must remain explicitly deferred until native button semantics can be preserved');
if (support.frameworks?.['native-web']?.status !== 'button-baseline-implemented') throw new Error('Native Web must identify the implemented Button baseline');
if (support.browsers?.playwright !== root.devDependencies['@playwright/test']) throw new Error('browser validation baseline must match the pinned Playwright toolchain');
for (const engine of ['chromium', 'firefox', 'webkit']) if (!support.browsers?.[engine]) throw new Error(`browser validation baseline is missing ${engine}`);
if (support.ssrBundlers?.status !== 'button-port-validation-active') throw new Error('SSR/bundler compatibility must identify Button port validation once real framework ports exist');

process.stdout.write('compatibility metadata: ok\n');
