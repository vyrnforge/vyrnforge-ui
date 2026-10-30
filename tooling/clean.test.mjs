import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanRepository } from './clean.mjs';

const temporaryRoots = [];

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function makeTemporaryRepository(workspaceSource) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'vyrnforge-clean-'));
  temporaryRoots.push(root);
  await writeFile(path.join(root, 'pnpm-workspace.yaml'), workspaceSource, 'utf8');
  return root;
}

async function expectMissing(target) {
  await expect(access(target)).rejects.toMatchObject({ code: 'ENOENT' });
}

describe('repository clean', () => {
  it('removes root and explicit package dist directories from pnpm workspace configuration', async () => {
    const root = await makeTemporaryRepository(`packages:\n  - packages/core\n  - packages/web\n`);
    const distRoots = [path.join(root, 'dist'), path.join(root, 'packages/core/dist'), path.join(root, 'packages/web/dist')];

    for (const distRoot of distRoots) {
      await mkdir(distRoot, { recursive: true });
      await writeFile(path.join(distRoot, 'artifact.txt'), 'generated', 'utf8');
    }

    await cleanRepository(root);

    for (const distRoot of distRoots) await expectMissing(distRoot);
    await access(path.join(root, 'packages/core'));
    await access(path.join(root, 'packages/web'));
  });

  it('rejects unsupported workspace patterns before deleting output', async () => {
    const root = await makeTemporaryRepository(`packages:\n  - packages/*\n`);
    const marker = path.join(root, 'dist/keep.txt');
    await mkdir(path.dirname(marker), { recursive: true });
    await writeFile(marker, 'keep', 'utf8');

    await expect(cleanRepository(root)).rejects.toThrow('pnpm workspace packages must use explicit package paths');
    await access(marker);
  });
});
