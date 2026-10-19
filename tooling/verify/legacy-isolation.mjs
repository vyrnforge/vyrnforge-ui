import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const rootManifest = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
if ((rootManifest.workspaces ?? []).some((workspace) => workspace.includes('legacy'))) throw new Error('packages/legacy must not participate in active workspaces');
const activePackages = ['core', 'web', 'react', 'angular', 'vue', 'elements'];
for (const name of activePackages) {
  const manifest = JSON.parse(await readFile(new URL(`../../packages/${name}/package.json`, import.meta.url), 'utf8'));
  const serialized = JSON.stringify(manifest);
  if (serialized.includes('@vyrnforge/legacy') || serialized.includes('packages/legacy')) throw new Error(`${manifest.name} references the legacy quarantine`);
}
async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) { const full = path.join(directory, entry.name); if (entry.isDirectory()) files.push(...await collect(full)); else files.push(full); }
  return files;
}
for (const directory of ['components', 'documentation', 'fixtures']) {
  for (const file of await collect(directory)) {
    const content = await readFile(file, 'utf8').catch(() => '');
    if (content.includes('@vyrnforge/legacy') || content.includes('packages/legacy/archive')) throw new Error(`${file} depends on legacy implementation details`);
  }
}
process.stdout.write('legacy isolation: ok\n');
