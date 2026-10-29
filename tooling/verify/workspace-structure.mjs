import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const expectedWorkspaces = ['packages/core', 'packages/web', 'packages/icons', 'packages/react', 'packages/angular', 'packages/vue', 'packages/elements'];
const repositoryRoots = ['apps', 'documentation', 'packages', 'product', 'tooling'];
const forbiddenToolingCapabilityNames = new Set(['common', 'misc', 'scripts', 'utils']);
const capabilityNamePattern = /^[a-z][a-z0-9-]*$/;
const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
const pnpmWorkspace = await readFile(new URL('../../pnpm-workspace.yaml', import.meta.url), 'utf8');
const toolingPackageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));

const workspaceEntries = [...pnpmWorkspace.matchAll(/^\s*-\s+(packages\/[^\s]+)\s*$/gm)].map((match) => match[1]);
if (JSON.stringify(workspaceEntries) !== JSON.stringify(expectedWorkspaces)) {
  throw new Error(`pnpm workspace must contain exactly the public packages: ${expectedWorkspaces.join(', ')}`);
}
if ('workspaces' in packageJson) throw new Error('npm workspaces must not remain after the pnpm migration');
if (toolingPackageJson.name !== '@vyrnforge/repository-tooling') {
  throw new Error(`tooling/package.json must declare @vyrnforge/repository-tooling, found ${toolingPackageJson.name ?? '<missing>'}`);
}
if (toolingPackageJson.private !== true) throw new Error('tooling/package.json must remain private');
if (toolingPackageJson.type !== 'module') throw new Error('tooling/package.json must declare type=module');

const rootEngines = packageJson.engines ?? {};
const toolingEngines = toolingPackageJson.engines ?? {};
if (
  Object.keys(rootEngines).length !== Object.keys(toolingEngines).length ||
  Object.entries(rootEngines).some(([engine, range]) => toolingEngines[engine] !== range)
) {
  throw new Error('tooling/package.json engines must match the repository root engines');
}

for (const relative of repositoryRoots) await access(new URL(`../../${relative}/`, import.meta.url));
for (const removedRoot of ['components', 'fixtures', 'testing']) {
  try {
    await access(new URL(`../../${removedRoot}/`, import.meta.url));
    throw new Error(`Retired repository root must not exist: ${removedRoot}/`);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

const toolingEntries = await readdir(new URL('../', import.meta.url), { withFileTypes: true });
const toolingCapabilities = toolingEntries.filter((entry) => entry.isDirectory());
if (toolingCapabilities.length === 0) throw new Error('tooling/ must contain at least one maintained capability directory');

for (const capability of toolingCapabilities) {
  if (!capabilityNamePattern.test(capability.name)) {
    throw new Error(`Tooling capability names must use lowercase kebab-case: tooling/${capability.name}/`);
  }
  if (forbiddenToolingCapabilityNames.has(capability.name)) {
    throw new Error(`Generic catch-all tooling capability is forbidden: tooling/${capability.name}/`);
  }
  try {
    await access(new URL(`../${capability.name}/README.md`, import.meta.url));
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Tooling capability must define its local ownership contract: tooling/${capability.name}/README.md`);
    }
    throw error;
  }
}

for (const workspace of expectedWorkspaces) {
  const manifest = JSON.parse(await readFile(new URL(`../../${workspace}/package.json`, import.meta.url), 'utf8'));
  const expectedName = `@vyrnforge/${path.basename(workspace)}`;
  if (manifest.name !== expectedName) throw new Error(`${workspace} must declare ${expectedName}, found ${manifest.name ?? '<missing>'}`);
}

process.stdout.write(`workspace structure: ${repositoryRoots.length} repository roots, ${expectedWorkspaces.length} public packages, 1 private tooling package, and ${toolingCapabilities.length} need-driven tooling capabilities ok\n`);
