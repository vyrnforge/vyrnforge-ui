import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));

await rm(path.join(root, 'dist'), { recursive: true, force: true });

for (const workspace of manifest.workspaces ?? []) {
  if (typeof workspace !== 'string' || workspace.includes('*')) {
    throw new Error(`Repository clean requires explicit workspace paths, found ${JSON.stringify(workspace)}`);
  }
  await rm(path.join(root, workspace, 'dist'), { recursive: true, force: true });
}
