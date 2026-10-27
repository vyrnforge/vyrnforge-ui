import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { componentBrowserServerManagedEnv } from '../testing/component-browser-runtime.mjs';
import { createComponentBrowserConfig } from '../testing/component-browser-config.mjs';
import { expandScopes } from './scopes.mjs';
import { browserProjectsForExecution, createExecutionPlan, executeValidationPlan } from './execute.mjs';

test('framework build execution includes foundation prerequisites once', () => {
  const execution = expandScopes(['build-react']);
  assert.deepEqual(execution.map((item) => item.scope), ['lint-react', 'lint-core', 'build-core', 'lint-web', 'build-web', 'build-react']);
});

test('duplicate prerequisites execute once and retain immediate consumers', () => {
  const execution = expandScopes(['pack-react', 'pack-vue']);
  assert.equal(execution.filter((item) => item.scope === 'build-core').length, 1);
  assert.equal(execution.filter((item) => item.scope === 'build-web').length, 1);
  assert.deepEqual(execution.find((item) => item.scope === 'build-core').requiredBy, ['build-react', 'build-vue', 'build-web']);
});

test('component scopes resolve from discovered ownership rather than CI definitions', () => {
  const execution = expandScopes([
    'component:button:react:types',
    'component:button:react:ssr',
    'component:button:react:browser',
    'component:button:conformance:types',
  ]);
  assert.deepEqual(execution.find((item) => item.scope === 'component:button:react:types').command, ['node', 'tooling/testing/check-component-types.mjs', 'button', 'react']);
  assert.deepEqual(execution.find((item) => item.scope === 'component:button:react:ssr').command, ['node', 'tooling/testing/run-component-ssr.mjs', 'button', 'react']);
  assert.deepEqual(execution.find((item) => item.scope === 'component:button:react:browser').command, ['node', 'tooling/testing/run-component-browser.mjs', 'button', 'react', 'chromium']);
  assert.deepEqual(execution.find((item) => item.scope === 'component:button:conformance:types').command, ['node', 'tooling/testing/check-component-types.mjs', 'button', 'conformance']);
});

test('browser setup selects the widest required browser matrix', () => {
  const chromium = expandScopes(['component:button:react:browser', 'component:button:vue:browser']);
  assert.deepEqual(browserProjectsForExecution(chromium), ['chromium']);
  const cross = expandScopes(['component:button:web:browser-cross', 'component:button:react:browser']);
  assert.deepEqual(browserProjectsForExecution(cross), ['chromium', 'firefox', 'webkit']);
  assert.deepEqual(browserProjectsForExecution(expandScopes(['pack-core'])), []);
});

test('executor-owned browser server is expressed directly by shared config', () => {
  const previous = process.env[componentBrowserServerManagedEnv];
  process.env[componentBrowserServerManagedEnv] = '1';
  try {
    const config = createComponentBrowserConfig({ componentId: 'button', port: 'react' });
    assert.equal(config.webServer, undefined);
  } finally {
    if (previous === undefined) delete process.env[componentBrowserServerManagedEnv];
    else process.env[componentBrowserServerManagedEnv] = previous;
  }
});

test('change rendering depends on fragment validation', () => {
  const execution = expandScopes(['changes-preview']);
  assert.deepEqual(execution.map((item) => item.scope), ['change-fragments', 'changes-preview']);
  assert.deepEqual(execution.find((item) => item.scope === 'change-fragments').requiredBy, ['changes-preview']);
});

test('validation plans retain selection and prerequisite provenance', () => {
  const execution = createExecutionPlan({
    validationScopes: ['structure', 'pack-core'],
    scopeReasons: { structure: ['global sentinel'], 'pack-core': ['package verification'] },
  });
  assert.deepEqual(execution.map((item) => item.scope), ['structure', 'lint-core', 'build-core', 'pack-core']);
  assert.deepEqual(execution.find((item) => item.scope === 'structure').reasons, ['global sentinel']);
  assert.deepEqual(execution.find((item) => item.scope === 'build-core').reasons, ['prerequisite for pack-core']);
  assert.deepEqual(execution.find((item) => item.scope === 'pack-core').reasons, ['package verification']);
});

test('executor persists duration and partial failure evidence', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'vf-impact-executor-'));
  const output = path.join(directory, 'validation-plan.json');
  let clock = 0;
  try {
    await assert.rejects(() => executeValidationPlan(
      { mode: 'pr', changedPaths: [], validationScopes: ['pack-core'], scopeReasons: { 'pack-core': ['package verification'] } },
      {
        output,
        now: () => clock,
        runCommand: (_command, args) => {
          clock += 10;
          if (args.includes('build:core')) throw Object.assign(new Error('build failed'), { status: 7 });
        },
      },
    ), /build failed/);
    const report = JSON.parse(readFileSync(output, 'utf8'));
    assert.deepEqual(report.results.map((result) => [result.scope, result.outcome]), [['lint-core', 'success'], ['build-core', 'failure']]);
    assert.equal(report.results.at(-1).exitCode, 7);
    assert.equal(report.results.at(-1).durationMs, 10);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('executor starts one shared docs server and marks component browser commands as managed', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'vf-impact-browser-server-'));
  const output = path.join(directory, 'validation-plan.json');
  let starts = 0;
  let stops = 0;
  const managed = [];
  try {
    await executeValidationPlan(
      { mode: 'pr', changedPaths: [], validationScopes: ['component:button:react:browser', 'component:button:vue:browser'], scopeReasons: {} },
      {
        output,
        runCommand: () => {},
        runBrowserCommand: async (_command, _args, options) => managed.push(options.env[componentBrowserServerManagedEnv]),
        startBrowserServer: async () => { starts += 1; return { pid: 1234 }; },
        stopBrowserServer: async () => { stops += 1; },
      },
    );
    assert.equal(starts, 1);
    assert.equal(stops, 1);
    assert.deepEqual(managed, ['1', '1']);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('non-component browser evidence does not start the shared component server', async () => {
  let starts = 0;
  await executeValidationPlan(
    { mode: 'pr', changedPaths: [], validationScopes: ['browser-docs-chromium'], scopeReasons: {} },
    {
      runCommand: () => {},
      startBrowserServer: async () => { starts += 1; return {}; },
      stopBrowserServer: async () => {},
    },
  );
  assert.equal(starts, 0);
});

test('unknown validation scopes fail closed', () => {
  assert.throws(() => expandScopes(['not-real']), /No executor registered/);
  assert.throws(() => expandScopes(['component:not-real:react:ssr']), /No executor registered/);
});
