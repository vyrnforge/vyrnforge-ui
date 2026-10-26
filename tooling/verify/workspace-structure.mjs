import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const expectedWorkspaces = ['packages/core', 'packages/web', 'packages/icons', 'packages/react', 'packages/angular', 'packages/vue', 'packages/elements'];
const repositoryRoots = ['apps', 'documentation', 'packages', 'product', 'tooling'];
const toolingOwners = ['build', 'ci', 'docs', 'impact', 'release', 'testing', 'tokens', 'verify'];
const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
if (JSON.stringify(packageJson.workspaces) !== JSON.stringify(expectedWorkspaces)) throw new Error(`Root workspaces must be exactly: ${expectedWorkspaces.join(', ')}`);
for (const relative of repositoryRoots) await access(new URL(`../../${relative}/`, import.meta.url));
for (const removedRoot of ['components', 'fixtures', 'testing']) {
  try { await access(new URL(`../../${removedRoot}/`, import.meta.url)); throw new Error(`Retired repository root must not exist: ${removedRoot}/`); }
  catch (error) { if (error?.code !== 'ENOENT') throw error; }
}
for (const owner of toolingOwners) await access(new URL(`../${owner}/`, import.meta.url));
for (const workspace of expectedWorkspaces) {
  const manifest = JSON.parse(await readFile(new URL(`../../${workspace}/package.json`, import.meta.url), 'utf8'));
  const expectedName = `@vyrnforge/${path.basename(workspace)}`;
  if (manifest.name !== expectedName) throw new Error(`${workspace} must declare ${expectedName}, found ${manifest.name ?? '<missing>'}`);
}
process.stdout.write('workspace structure: five repository roots, eight tooling owners, and seven-package graph ok\n');
