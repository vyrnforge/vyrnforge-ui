import { access, readFile } from 'node:fs/promises';

const required = [
  'testing/README.md',
  'testing/impact.json',
  'testing/contracts/README.md',
  'testing/ports/README.md',
  'testing/browser/README.md',
  'testing/visual/README.md',
  'testing/ssr/README.md',
  'testing/components/registry.json'
];
for (const file of required) await access(file);

const impact = JSON.parse(await readFile('testing/impact.json', 'utf8'));
if (impact.schemaVersion !== 1) throw new Error('testing impact metadata must use schemaVersion 1');
if (!impact.targets || typeof impact.targets !== 'object') throw new Error('testing impact metadata must expose targets');
if (!Array.isArray(impact.broadPaths) || !Array.isArray(impact.globalSentinels) || !Array.isArray(impact.scopeOrder)) throw new Error('testing impact metadata is missing path/scope arrays');
for (const [target, config] of Object.entries(impact.targets)) {
  if (!Array.isArray(config.paths) || !Array.isArray(config.dependsOn) || !Array.isArray(config.evidence)) throw new Error(`invalid impact target metadata: ${target}`);
}

const registry = JSON.parse(await readFile('testing/components/registry.json', 'utf8'));
if (registry.schemaVersion !== 1) throw new Error('testing component registry must use schemaVersion 1');
if (!Array.isArray(registry.components)) throw new Error('testing component registry must expose a components array');

const ids = new Set();
const allowedPorts = new Set(['web', 'react', 'angular', 'vue', 'elements']);
for (const entry of registry.components) {
  if (!entry || typeof entry !== 'object') throw new Error('testing component registry entries must be objects');
  if (typeof entry.component !== 'string' || !entry.component) throw new Error('testing component registry entry missing component');
  if (ids.has(entry.component)) throw new Error(`duplicate testing component registry entry: ${entry.component}`);
  ids.add(entry.component);
  if (!['contract-approved', 'implementing', 'implemented'].includes(entry.status)) throw new Error(`invalid testing status for ${entry.component}`);
  if (!entry.ports || typeof entry.ports !== 'object' || Array.isArray(entry.ports)) throw new Error(`testing registry ports must be an object for ${entry.component}`);
  if (!Array.isArray(entry.documentationPaths)) throw new Error(`testing registry documentationPaths must be an array for ${entry.component}`);

  for (const [port, config] of Object.entries(entry.ports)) {
    if (!allowedPorts.has(port)) throw new Error(`unsupported testing port ${port} for ${entry.component}`);
    if (!config || typeof config !== 'object' || !Array.isArray(config.paths) || config.paths.length === 0) throw new Error(`testing registry paths missing for ${entry.component}/${port}`);
    if (config.ssr) await access(config.ssr);
  }
  if (entry.types) await access(entry.types);
  if (Object.values(entry.ports).some((port) => port.browser)) {
    if (!entry.browser?.runner) throw new Error(`browser evidence requires a runner for ${entry.component}`);
    await access(entry.browser.runner);
  }
}

process.stdout.write(`testing structure: ${registry.components.length} metadata-driven components\n`);
