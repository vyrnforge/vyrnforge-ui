import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expandScopes } from '../impact/scopes.mjs';
import { browserProjectsForExecution, createExecutionPlan, executeValidationPlan } from '../impact/execute.mjs';

test('framework build execution includes foundation prerequisites once', () => {
  const execution = expandScopes(['build-react']);
  assert.deepEqual(execution.map((item) => item.scope), ['lint-react', 'lint-core', 'build-core', 'lint-web', 'build-web', 'build-react']);
});

test('duplicate prerequisites execute once and retain all immediate prerequisite consumers', () => {
  const execution = expandScopes(['pack-react', 'pack-vue']);
  assert.equal(execution.filter((item) => item.scope === 'build-core').length, 1);
  assert.equal(execution.filter((item) => item.scope === 'build-web').length, 1);
  assert.deepEqual(execution.find((item) => item.scope === 'build-core').requiredBy, ['build-react', 'build-vue', 'build-web']);
});

test('representative bundle baselines build every implemented proof-component port once', () => {
  const execution = expandScopes(['bundle-baselines']);
  for (const scope of ['build-web', 'build-react', 'build-angular', 'build-vue', 'build-elements', 'bundle-baselines']) {
    assert.equal(execution.filter((item) => item.scope === scope).length, 1, scope);
  }
  assert.deepEqual(execution.at(-1)?.command, ['node', 'tooling/performance/measure-representative-bundles.mjs', '--check']);
});

test('component scopes resolve from discovered ownership instead of CI definitions', () => {
  const execution = expandScopes(['component:button:react:types', 'component:button:react:ssr', 'component:button:react:browser', 'component:button:conformance:types']);
  assert.deepEqual(execution.find((item) => item.scope === 'component:button:react:types').command, ['node', 'tooling/testing/check-component-types.mjs', 'button', 'react']);
  assert.deepEqual(execution.find((item) => item.scope === 'component:button:react:ssr').command, ['node', 'tooling/testing/run-component-ssr.mjs', 'button', 'react']);
  assert.deepEqual(execution.find((item) => item.scope === 'component:button:react:browser').command, ['node', 'tooling/testing/run-component-browser.mjs', 'button', 'react', 'chromium']);
  assert.deepEqual(execution.find((item) => item.scope === 'component:button:conformance:types').command, ['node', 'tooling/testing/check-component-types.mjs', 'button', 'conformance']);
});

test('component documentation uses a targeted source/example checker without full docs prerequisites', () => {
  const execution = expandScopes(['docs-source', 'component:button:docs']);
  assert.deepEqual(execution.map((item) => item.scope), ['docs-source', 'component:button:docs']);
  assert.deepEqual(execution.at(-1)?.command, ['node', 'tooling/docs/check-component.mjs', 'button']);
  for (const scope of ['build-react', 'build-angular', 'build-vue', 'build-elements', 'docs-build', 'browser-docs-chromium']) {
    assert.equal(execution.some((item) => item.scope === scope), false, scope);
  }
});

test('browser setup is deduplicated to the widest selected browser matrix', () => {
  const chromium = expandScopes(['component:button:react:browser', 'component:button:vue:browser']);
  assert.deepEqual(browserProjectsForExecution(chromium), ['chromium']);
  const cross = expandScopes(['component:button:web:browser-cross', 'component:button:react:browser']);
  assert.deepEqual(browserProjectsForExecution(cross), ['chromium', 'firefox', 'webkit']);
  assert.deepEqual(browserProjectsForExecution(expandScopes(['pack-core'])), []);
});

test('change rendering depends on fragment validation', () => {
  const execution = expandScopes(['changes-preview']);
  assert.deepEqual(execution.map((item) => item.scope), ['change-fragments', 'changes-preview']);
  assert.deepEqual(execution.find((item) => item.scope === 'change-fragments').requiredBy, ['changes-preview']);
});

test('validation plans become inspectable execution plans with selection and prerequisite reasons', () => {
  const execution = createExecutionPlan({ validationScopes: ['structure', 'pack-core'], scopeReasons: { structure: ['global sentinel'], 'pack-core': ['evidence for package:core:public-surface'] } });
  assert.deepEqual(execution.map((item) => item.scope), ['structure', 'lint-core', 'build-core', 'pack-core']);
  assert.deepEqual(execution.find((item) => item.scope === 'structure').reasons, ['global sentinel']);
  assert.deepEqual(execution.find((item) => item.scope === 'build-core').reasons, ['prerequisite for pack-core']);
  assert.deepEqual(execution.find((item) => item.scope === 'pack-core').reasons, ['evidence for package:core:public-surface']);
});

test('executor persists per-scope duration and prerequisite provenance', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'vf-impact-'));
  const output = path.join(directory, 'validation-plan.json');
  let clock = 0;
  try {
    executeValidationPlan(
      { mode: 'pr', changedPaths: [], validationScopes: ['pack-core'], scopeReasons: { 'pack-core': ['package verification'] } },
      { output, runCommand: () => { clock += 25; }, now: () => clock },
    );
    const report = JSON.parse(readFileSync(output, 'utf8'));
    assert.equal(report.results.length, 3);
    assert.deepEqual(report.results.map((result) => result.scope), ['lint-core', 'build-core', 'pack-core']);
    assert.ok(report.results.every((result) => result.durationMs === 25));
    assert.deepEqual(report.results.find((result) => result.scope === 'build-core').requiredBy, ['pack-core']);
    assert.deepEqual(report.results.find((result) => result.scope === 'pack-core').reasons, ['package verification']);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('executor preserves partial timing evidence when a scope fails', () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'vf-impact-failure-'));
  const output = path.join(directory, 'validation-plan.json');
  let clock = 0;
  try {
    assert.throws(() => executeValidationPlan(
      { mode: 'pr', changedPaths: [], validationScopes: ['pack-core'], scopeReasons: { 'pack-core': ['package verification'] } },
      {
        output,
        now: () => clock,
        runCommand: (_command, args) => {
          clock += 10;
          if (args.includes('build:core')) {
            const error = new Error('build failed');
            error.status = 7;
            throw error;
          }
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

test('unknown validation scopes fail closed', () => {
  assert.throws(() => expandScopes(['not-real']), /No executor registered/);
  assert.throws(() => expandScopes(['component:not-real:react:ssr']), /No executor registered/);
});
