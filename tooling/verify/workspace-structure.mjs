import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const expectedWorkspaces = ['packages/core', 'packages/web', 'packages/icons', 'packages/react', 'packages/angular', 'packages/vue', 'packages/elements'];
const repositoryOnly = ['components', 'documentation', 'fixtures', 'tooling'];
const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
if (JSON.stringify(packageJson.workspaces) !== JSON.stringify(expectedWorkspaces)) throw new Error(`Root workspaces must be exactly: ${expectedWorkspaces.join(', ')}`);
for (const relative of [...expectedWorkspaces, ...repositoryOnly]) await access(new URL(`../../${relative}/`, import.meta.url));
for (const workspace of expectedWorkspaces) {
  const manifest = JSON.parse(await readFile(new URL(`../../${workspace}/package.json`, import.meta.url), 'utf8'));
  const expectedName = `@vyrnforge/${path.basename(workspace)}`;
  if (manifest.name !== expectedName) throw new Error(`${workspace} must declare ${expectedName}, found ${manifest.name ?? '<missing>'}`);
}
process.stdout.write('workspace structure: package graph and product ownership roots ok\n');
