import test from 'node:test';
import assert from 'node:assert/strict';
import { expandScopes } from '../impact/scopes.mjs';
import { createExecutionPlan } from '../impact/execute.mjs';

test('framework build execution includes foundation prerequisites without marking them as selected evidence', () => {
  const execution = expandScopes(['build-react']);
  assert.deepEqual(execution.map((item) => item.scope), ['build-core', 'build-web', 'build-react']);
  assert.deepEqual(execution.map((item) => item.selected), [false, false, true]);
});

test('duplicate prerequisites execute once', () => {
  const execution = expandScopes(['pack-react', 'pack-vue']);
  assert.equal(execution.filter((item) => item.scope === 'build-core').length, 1);
  assert.equal(execution.filter((item) => item.scope === 'build-web').length, 1);
});

test('validation plans become inspectable execution plans', () => {
  const execution = createExecutionPlan({ validationScopes: ['structure', 'pack-core'] });
  assert.deepEqual(execution.map((item) => item.scope), ['structure', 'build-core', 'pack-core']);
});

test('unknown validation scopes fail closed', () => {
  assert.throws(() => expandScopes(['not-real']), /No executor registered/);
});
