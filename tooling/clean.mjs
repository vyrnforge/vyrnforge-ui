import { rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPnpmWorkspacePaths } from './workspaces.mjs';

const repositoryRoot = path.resolve(fileURLToPath(new URL('../', import.meta.url)));

export async function cleanRepository(root = repositoryRoot) {
  const workspaces = await readPnpmWorkspacePaths(path.join(root, 'pnpm-workspace.yaml'));

  await rm(path.join(root, 'dist'), { recursive: true, force: true });
  for (const workspace of workspaces) {
    await rm(path.join(root, workspace, 'dist'), { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await cleanRepository();
}
