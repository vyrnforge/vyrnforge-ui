import { access, readFile } from 'node:fs/promises';

const required = [
  'testing/README.md',
  'testing/contracts/README.md',
  'testing/ports/README.md',
  'testing/browser/README.md',
  'testing/visual/README.md',
  'testing/ssr/README.md',
  'testing/components/registry.json'
];
for (const file of required) await access(file);

const registry = JSON.parse(await readFile('testing/components/registry.json', 'utf8'));
if (!Array.isArray(registry.components)) throw new Error('testing component registry must expose a components array');
const ids = new Set();
for (const entry of registry.components) {
  if (!entry || typeof entry !== 'object') throw new Error('testing component registry entries must be objects');
  if (typeof entry.component !== 'string' || !entry.component) throw new Error('testing component registry entry missing component');
  if (ids.has(entry.component)) throw new Error(`duplicate testing component registry entry: ${entry.component}`);
  ids.add(entry.component);
  if (!['contract-approved', 'implementing', 'implemented'].includes(entry.status)) throw new Error(`invalid testing status for ${entry.component}`);
  if (!Array.isArray(entry.ports)) throw new Error(`testing registry ports must be an array for ${entry.component}`);
}
process.stdout.write(`testing structure: ${registry.components.length} registered rebuilt components\n`);
