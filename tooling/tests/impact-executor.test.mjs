import test from 'node:test';
import assert from 'node:assert/strict';
import { expandScopes } from '../impact/scopes.mjs';
import { createExecutionPlan } from '../impact/execute.mjs';

test('framework build execution includes lint and foundation prerequisites without marking them as selected evidence', () => {
  const execution = expandScopes(['build-react']);
  assert.deepEqual(execution.map((item) => item.scope), ['lint-react', 'lint-core', 'build-core', 'lint-web', 'build-web', 'build-react']);
  assert.deepEqual(execution.map((item) => item.selected), [false, false, false, false, false, true]);
});

test('duplicate prerequisites execute once', () => {
  const execution = expandScopes(['pack-react', 'pack-vue']);
  assert.equal(execution.filter((item) => item.scope === 'lint-core').length, 1);
  assert.equal(execution.filter((item) => item.scope === 'build-core').length, 1);
  assert.equal(execution.filter((item) => item.scope === 'lint-web').length, 1);
  assert.equal(execution.filter((item) => item.scope === 'build-web').length, 1);
});

test('validation plans become inspectable execution plans', () => {
  const execution = createExecutionPlan({ validationScopes: ['structure', 'pack-core'] });
  assert.deepEqual(execution.map((item) => item.scope), ['structure', 'lint-core', 'build-core', 'pack-core']);
  assert.deepEqual(execution.map((item) => item.selected), [true, false, false, true]);
});

test('unknown validation scopes fail closed', () => {
  assert.throws(() => expandScopes(['not-real']), /No executor registered/);
});
