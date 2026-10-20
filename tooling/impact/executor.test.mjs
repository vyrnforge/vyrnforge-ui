import test from 'node:test';
import assert from 'node:assert/strict';
import { expandScopes } from '../impact/scopes.mjs';
import { createExecutionPlan } from '../impact/execute.mjs';

test('framework build execution includes foundation prerequisites once', () => {
  const execution = expandScopes(['build-react']);
  assert.deepEqual(execution.map((item) => item.scope), ['lint-react', 'lint-core', 'build-core', 'lint-web', 'build-web', 'build-react']);
});

test('duplicate prerequisites execute once', () => {
  const execution = expandScopes(['pack-react', 'pack-vue']);
  assert.equal(execution.filter((item) => item.scope === 'build-core').length, 1);
  assert.equal(execution.filter((item) => item.scope === 'build-web').length, 1);
});

test('representative bundle baselines build every implemented proof-component port once', () => {
  const execution = expandScopes(['bundle-baselines']);
  for (const scope of ['build-web', 'build-react', 'build-angular', 'build-vue', 'bundle-baselines']) {
    assert.equal(execution.filter((item) => item.scope === scope).length, 1, scope);
  }
  assert.deepEqual(execution.at(-1)?.command, ['node', 'tooling/performance/measure-representative-bundles.mjs', '--check']);
  assert.equal(execution.some((item) => item.scope === 'build-elements'), false);
});

test('component scopes resolve from discovered ownership instead of CI definitions', () => {
  const execution = expandScopes(['component:button:react:types', 'component:button:react:ssr', 'component:button:react:browser', 'component:button:conformance:types']);
  assert.deepEqual(execution.find((item) => item.scope === 'component:button:react:types').command, ['node', 'tooling/testing/check-component-types.mjs', 'button', 'react']);
  assert.deepEqual(execution.find((item) => item.scope === 'component:button:react:ssr').command, ['node', 'tooling/testing/run-component-ssr.mjs', 'button', 'react']);
  assert.deepEqual(execution.find((item) => item.scope === 'component:button:react:browser').command, ['node', 'tooling/testing/run-component-browser.mjs', 'button', 'react', 'chromium']);
  assert.deepEqual(execution.find((item) => item.scope === 'component:button:conformance:types').command, ['node', 'tooling/testing/check-component-types.mjs', 'button', 'conformance']);
});

test('change rendering depends on fragment validation', () => {
  const execution = expandScopes(['changes-preview']);
  assert.deepEqual(execution.map((item) => item.scope), ['change-fragments', 'changes-preview']);
});

test('validation plans become inspectable execution plans', () => {
  const execution = createExecutionPlan({ validationScopes: ['structure', 'pack-core'] });
  assert.deepEqual(execution.map((item) => item.scope), ['structure', 'lint-core', 'build-core', 'pack-core']);
});

test('unknown validation scopes fail closed', () => {
  assert.throws(() => expandScopes(['not-real']), /No executor registered/);
  assert.throws(() => expandScopes(['component:not-real:react:ssr']), /No executor registered/);
});
