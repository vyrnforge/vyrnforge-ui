import { test } from 'vitest';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { localChangedPaths } from './local.mjs';

function git(cwd, ...args) {
  return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8' }).trim();
}

function write(root, relativePath, content) {
  writeFileSync(path.join(root, relativePath), content);
}

test('local change discovery includes committed branch, working tree, and untracked changes', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-local-impact-'));
  git(root, 'init', '-b', 'main');
  git(root, 'config', 'user.name', 'VyrnForge Test');
  git(root, 'config', 'user.email', 'test@vyrnforge.invalid');

  write(root, 'tracked.txt', 'base\n');
  git(root, 'add', 'tracked.txt');
  git(root, 'commit', '-m', 'base');

  git(root, 'checkout', '-b', 'feature');
  write(root, 'committed.txt', 'branch\n');
  git(root, 'add', 'committed.txt');
  git(root, 'commit', '-m', 'branch change');

  write(root, 'tracked.txt', 'working tree\n');
  write(root, 'untracked.txt', 'new\n');

  assert.deepEqual(localChangedPaths({ cwd: root, baseRef: 'main' }), [
    'committed.txt',
    'tracked.txt',
    'untracked.txt',
  ]);
});

test('local change discovery fails closed when its comparison base cannot be resolved', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-local-impact-missing-base-'));
  git(root, 'init', '-b', 'main');
  git(root, 'config', 'user.name', 'VyrnForge Test');
  git(root, 'config', 'user.email', 'test@vyrnforge.invalid');
  write(root, 'tracked.txt', 'base\n');
  git(root, 'add', 'tracked.txt');
  git(root, 'commit', '-m', 'base');

  assert.throws(
    () => localChangedPaths({ cwd: root, baseRef: 'does-not-exist' }),
    /Unable to resolve local validation base/,
  );
});
