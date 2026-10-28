import { access, readFile } from 'node:fs/promises';
import { assertProductPreparation } from '../testing/discover-product-units.mjs';

for (const file of ['tooling/testing/README.md', 'tooling/impact/config.json', 'tooling/README.md']) await access(file);

const impact = JSON.parse(await readFile('tooling/impact/config.json', 'utf8'));
if (impact.schemaVersion !== 1) throw new Error('impact metadata must use schemaVersion 1');
if (!impact.targets || typeof impact.targets !== 'object') throw new Error('impact metadata must expose targets');
if (!Array.isArray(impact.broadPaths) || !Array.isArray(impact.globalSentinels) || !Array.isArray(impact.scopeOrder)) {
  throw new Error('impact metadata is missing path/scope arrays');
}
for (const [target, config] of Object.entries(impact.targets)) {
  if (!Array.isArray(config.paths) || !Array.isArray(config.dependsOn) || !Array.isArray(config.evidence)) {
    throw new Error(`invalid impact target metadata: ${target}`);
  }
}

const discovery = assertProductPreparation();
process.stdout.write(`testing structure: ${discovery.components.length} product components and ${discovery.ownedUnits.length} reusable scoped units prepared; repository testing infrastructure and impact metadata are structurally valid\n`);
