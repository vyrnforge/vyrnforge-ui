import { access, readFile } from 'node:fs/promises';
import { loadComponentStandards, summarizeComponentStandards } from '../accessibility/component-standards.mjs';
import { assertProductPreparation } from '../testing/discover-product-units.mjs';

const required = ['testing/README.md', 'testing/impact.json'];
const representativeAccessibilityMappings = new Set(['button', 'tabs', 'dialog', 'combobox', 'listbox', 'menu', 'toolbar']);
for (const file of required) await access(file);
const impact = JSON.parse(await readFile('testing/impact.json', 'utf8'));
if (impact.schemaVersion !== 1) throw new Error('testing impact metadata must use schemaVersion 1');
if (!impact.targets || typeof impact.targets !== 'object') throw new Error('testing impact metadata must expose targets');
if (!Array.isArray(impact.broadPaths) || !Array.isArray(impact.globalSentinels) || !Array.isArray(impact.scopeOrder)) throw new Error('testing impact metadata is missing path/scope arrays');
for (const [target, config] of Object.entries(impact.targets)) if (!Array.isArray(config.paths) || !Array.isArray(config.dependsOn) || !Array.isArray(config.evidence)) throw new Error(`invalid impact target metadata: ${target}`);
const discovery = assertProductPreparation();
const { standards } = await loadComponentStandards();
const accessibility = summarizeComponentStandards(standards);
if (accessibility.total !== discovery.components.length) throw new Error('accessibility standards inventory must classify every discovered component');
const byComponent = new Map(standards.map((entry) => [entry.component, entry]));
for (const component of representativeAccessibilityMappings) if (byComponent.get(component)?.reviewStatus !== 'mapped') throw new Error(`representative accessibility mapping must remain mapped: ${component}`);
process.stdout.write(`testing structure: policy-only testing root, ${discovery.components.length} components and ${discovery.ownedUnits.length} reusable scoped units prepared; accessibility ${accessibility.mapped} mapped/${accessibility.reviewRequired} review-required\n`);
