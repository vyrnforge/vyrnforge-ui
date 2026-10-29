import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, test } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const changesetBin = path.join(repoRoot, 'node_modules/.bin/changeset');
const fixtures = [];

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), 'vyrnforge-changesets-'));
  fixtures.push(root);
  mkdirSync(path.join(root, '.changeset'), { recursive: true });
  mkdirSync(path.join(root, 'packages/a'), { recursive: true });
  mkdirSync(path.join(root, 'packages/b'), { recursive: true });
  writeFileSync(path.join(root, 'package.json'), JSON.stringify({ private: true, workspaces: ['packages/*'] }, null, 2));
  writeFileSync(path.join(root, 'pnpm-workspace.yaml'), "packages:\n  - 'packages/*'\n");
  writeFileSync(path.join(root, '.changeset/config.json'), JSON.stringify({
    changelog: '@changesets/cli/changelog',
    commit: false,
    fixed: [],
    linked: [],
    access: 'restricted',
    baseBranch: 'main',
    updateInternalDependencies: 'patch',
    ignore: [],
    privatePackages: { version: true, tag: false },
  }, null, 2));
  writeFileSync(path.join(root, 'packages/a/package.json'), JSON.stringify({ name: '@fixture/a', version: '1.0.0' }, null, 2));
  writeFileSync(path.join(root, 'packages/b/package.json'), JSON.stringify({ name: '@fixture/b', version: '1.0.0', dependencies: { '@fixture/a': '^1.0.0' } }, null, 2));
  return root;
}

function version(root) {
  execFileSync(changesetBin, ['version'], { cwd: root, encoding: 'utf8', stdio: 'pipe' });
}

function json(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

afterEach(() => {
  for (const fixture of fixtures.splice(0)) rmSync(fixture, { recursive: true, force: true });
});

describe('Changesets release intent', () => {
  test('bumps an incompatible dependent and updates its internal range', () => {
    const root = makeWorkspace();
    writeFileSync(path.join(root, '.changeset/major-a.md'), `---\n"@fixture/a": major\n---\n\nReplace the A contract.\n`);

    version(root);

    const a = json(path.join(root, 'packages/a/package.json'));
    const b = json(path.join(root, 'packages/b/package.json'));
    expect(a.version).toBe('2.0.0');
    expect(b.version).toBe('1.0.1');
    expect(b.dependencies['@fixture/a']).toBe('^2.0.0');
    expect(readFileSync(path.join(root, 'packages/a/CHANGELOG.md'), 'utf8')).toContain('Replace the A contract.');
    expect(readFileSync(path.join(root, 'packages/b/CHANGELOG.md'), 'utf8')).toContain('Updated dependencies');
  });

  test('consumes an empty internal-only changeset without inventing a package bump', () => {
    const root = makeWorkspace();
    writeFileSync(path.join(root, '.changeset/internal-only.md'), `---\n---\n\nInternal repository tooling only; no package release intent.\n`);

    version(root);

    expect(json(path.join(root, 'packages/a/package.json')).version).toBe('1.0.0');
    expect(json(path.join(root, 'packages/b/package.json')).version).toBe('1.0.0');
  });
});
