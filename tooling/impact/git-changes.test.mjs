import { test } from 'vitest';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { changedPathsFromGit, changedPathsFromLocal } from './git-changes.mjs';

test('committed and staged ownership renames include both deletion and addition', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-impact-rename-'));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const oldPath = 'product/components/complex-ui/app-shell/component.json';
  const newPath = 'product/components/application-structures/app-shell/component.json';
  try {
    git('init', '-q');
    git('config', 'user.name', 'VyrnForge test');
    git('config', 'user.email', 'test@example.invalid');
    mkdirSync(path.dirname(path.join(root, oldPath)), { recursive: true });
    writeFileSync(path.join(root, oldPath), '{}\n');
    git('add', '.');
    git('commit', '-qm', 'baseline');
    const base = git('rev-parse', 'HEAD');
    mkdirSync(path.dirname(path.join(root, newPath)), { recursive: true });
    renameSync(path.join(root, oldPath), path.join(root, newPath));
    git('add', '-A');
    assert.deepEqual(changedPathsFromLocal(base, root), [newPath, oldPath].sort());
    git('commit', '-qm', 'move');
    const head = git('rev-parse', 'HEAD');
    assert.deepEqual(changedPathsFromGit(base, head, root).sort(), [newPath, oldPath].sort());
    rmSync(path.join(root, newPath));
    git('add', '-A');
    git('commit', '-qm', 'delete');
    assert.deepEqual(changedPathsFromGit(head, git('rev-parse', 'HEAD'), root), [newPath]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
