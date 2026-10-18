import { readFile } from 'node:fs/promises';

const root = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
const support = JSON.parse(await readFile(new URL('../compatibility/support-status.json', import.meta.url), 'utf8'));

if (support.schemaVersion !== 1) throw new Error('compatibility metadata schemaVersion must be 1');
if (support.status !== 'bootstrap') throw new Error('compatibility status must remain bootstrap until support ranges are approved');
if (support.runtime.node !== root.engines.node || support.runtime.npm !== root.engines.npm) {
  throw new Error('root engines and compatibility runtime metadata must match');
}
for (const framework of ['react', 'angular', 'vue']) {
  if (support.frameworks[framework] !== 'not-yet-selected') {
    throw new Error(`${framework} support range must not be invented before compatibility selection`);
  }
}

process.stdout.write('compatibility metadata: ok\n');
