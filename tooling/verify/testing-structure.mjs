import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { loadComponentStandards, summarizeComponentStandards } from '../accessibility/component-standards.mjs';
import { assertProductPreparation } from '../testing/discover-product-units.mjs';

const required = ['testing/README.md', 'testing/impact.json'];
const representativeAccessibilityMappings = new Set(['button', 'tabs', 'dialog']);
const sharedBrowserConfigSpecifier = '../../../../tooling/testing/component-browser-config.mjs';
const executableTestingExtension = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const levelCodedValidationName = /(^|[-:])l\d+(?=[-:]|$)/i;

async function assertPolicyOnlyTestingRoot(directory = 'testing') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await assertPolicyOnlyTestingRoot(target);
      continue;
    }
    if (entry.isFile() && executableTestingExtension.test(entry.name)) throw new Error(`${target} is executable test infrastructure; testing/ is policy-only and reusable harnesses belong under tooling/testing`);
  }
}

function assertSemanticValidationName(name, source) {
  if (levelCodedValidationName.test(name)) throw new Error(`${source} uses level-coded validation name ${name}; executable validation must use semantic product/evidence terminology`);
}

for (const file of required) await access(file);
await assertPolicyOnlyTestingRoot();
const impact = JSON.parse(await readFile('testing/impact.json', 'utf8'));
if (impact.schemaVersion !== 1) throw new Error('testing impact metadata must use schemaVersion 1');
if (!impact.targets || typeof impact.targets !== 'object') throw new Error('testing impact metadata must expose targets');
if (!Array.isArray(impact.broadPaths) || !Array.isArray(impact.globalSentinels) || !Array.isArray(impact.scopeOrder)) throw new Error('testing impact metadata is missing path/scope arrays');
for (const [target, config] of Object.entries(impact.targets)) {
  if (!Array.isArray(config.paths) || !Array.isArray(config.dependsOn) || !Array.isArray(config.evidence)) throw new Error(`invalid impact target metadata: ${target}`);
  for (const scope of config.evidence) assertSemanticValidationName(scope, `testing/impact.json target ${target}`);
}
for (const scope of impact.scopeOrder) assertSemanticValidationName(scope, 'testing/impact.json scopeOrder');
for (const [tier, scopes] of Object.entries(impact.tiers ?? {})) for (const scope of scopes) assertSemanticValidationName(scope, `testing/impact.json tier ${tier}`);

const rootManifest = JSON.parse(await readFile('package.json', 'utf8'));
for (const scriptName of Object.keys(rootManifest.scripts ?? {})) assertSemanticValidationName(scriptName, 'package.json script');
for (const entry of await readdir('tooling/verify', { withFileTypes: true })) {
  if (entry.isFile()) assertSemanticValidationName(entry.name, 'tooling/verify filename');
}

const discovery = assertProductPreparation();
for (const component of discovery.components) {
  const source = await readFile(component.browser.config, 'utf8');
  if (!source.includes(sharedBrowserConfigSpecifier) || !/create(?:CrossBrowser)?ComponentBrowserConfig/.test(source)) throw new Error(`${component.component} browser config must use the shared tooling/testing component browser harness`);
}
const { standards } = await loadComponentStandards();
const accessibility = summarizeComponentStandards(standards);
if (accessibility.total !== discovery.components.length) throw new Error('accessibility standards inventory must classify every discovered component');
const byComponent = new Map(standards.map((entry) => [entry.component, entry]));
for (const component of representativeAccessibilityMappings) if (byComponent.get(component)?.reviewStatus !== 'mapped') throw new Error(`representative accessibility mapping must remain mapped: ${component}`);
process.stdout.write(`testing structure: policy-only testing root, semantic validation naming, ${discovery.components.length} components and ${discovery.ownedUnits.length} reusable scoped units prepared; accessibility ${accessibility.mapped} mapped/${accessibility.reviewRequired} review-required\n`);
