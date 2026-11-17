import { test } from 'vitest';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertGeneratedOutputCurrent } from './generation.mjs';
import { renderRuntimeTokens } from './render.mjs';

test('accepts current deterministic generated output', () => {
  assert.doesNotThrow(() => assertGeneratedOutputCurrent('same', 'same'));
});

test('rejects stale generated output with the canonical remediation', () => {
  assert.throws(
    () => assertGeneratedOutputCurrent('stale', 'expected'),
    /packages\/web\/src\/styles\/tokens\.css is stale; run pnpm generate:tokens$/,
  );
});

test('root commands explicitly separate token generation from read-only verification', async () => {
  const rootPackage = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  assert.equal(rootPackage.scripts['generate:tokens'], 'node tooling/tokens/generate.mjs --write');
  assert.equal(rootPackage.scripts['verify:tokens'], 'node tooling/tokens/generate.mjs --check');
});

test('token CLI rejects drift without writes, writes deterministically, and rejects unsupported modes', async () => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'vyrnforge-token-cli-'));
  const fixtureTooling = join(fixtureRoot, 'tooling', 'tokens');
  const fixtureStyles = join(fixtureRoot, 'packages', 'web', 'src', 'styles');
  const outputPath = join(fixtureStyles, 'tokens.css');
  const localTooling = fileURLToPath(new URL('.', import.meta.url));

  try {
    await mkdir(fixtureTooling, { recursive: true });
    await mkdir(fixtureStyles, { recursive: true });
    await Promise.all(
      ['generate.mjs', 'generation.mjs', 'render.mjs', 'source.mjs', 'model.mjs'].map((name) =>
        copyFile(join(localTooling, name), join(fixtureTooling, name)),
      ),
    );
    const cli = join(fixtureTooling, 'generate.mjs');
    const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 15000 });
    const stale = '/* intentionally stale token fixture */\n';
    await writeFile(outputPath, stale);

    const staleCheck = run('--check');
    assert.notEqual(staleCheck.status, 0, 'a stale output must fail verification');
    assert.match(staleCheck.stderr, /tokens\.css is stale; run pnpm generate:tokens/);
    assert.equal(await readFile(outputPath, 'utf8'), stale, 'verification must never rewrite CSS');

    const defaultCheck = run();
    assert.notEqual(defaultCheck.status, 0, 'direct invocation defaults to a read-only check');
    assert.equal(await readFile(outputPath, 'utf8'), stale);

    const generated = run('--write');
    assert.equal(generated.status, 0, generated.stderr);
    assert.match(generated.stdout, /runtime tokens generated/);
    const expected = renderRuntimeTokens();
    assert.equal(await readFile(outputPath, 'utf8'), expected);

    const currentCheck = run('--check');
    assert.equal(currentCheck.status, 0, currentCheck.stderr);
    assert.match(currentCheck.stdout, /generated output is current/);

    const repeatedWrite = run('--write');
    assert.equal(repeatedWrite.status, 0, repeatedWrite.stderr);
    assert.equal(await readFile(outputPath, 'utf8'), expected, 'generation must be idempotent');

    const invalid = run('--unsupported');
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /Unknown token generation mode/);
    assert.equal(await readFile(outputPath, 'utf8'), expected, 'invalid modes must not mutate output');
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});
