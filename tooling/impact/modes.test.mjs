import test from 'node:test';
import assert from 'node:assert/strict';
import { validationPlanFromArgs } from './execute.mjs';

test('main mode requires changed-path input', () => {
  assert.throws(
    () => validationPlanFromArgs(['node', 'tooling/impact/execute.mjs', '--mode', 'main']),
    /Main validation requires changed-path input/,
  );
});

test('full mode explicitly selects the exhaustive main tier', () => {
  const plan = validationPlanFromArgs(['node', 'tooling/impact/execute.mjs', '--mode', 'full']);
  assert.equal(plan.mode, 'full');
  assert.equal(plan.changedPaths, undefined);
  assert.ok(plan.validationScopes.includes('consumer-all'));
  assert.ok(plan.validationScopes.includes('browser-docs-chromium'));
});

test('main mode with explicit files remains impact scoped', () => {
  const plan = validationPlanFromArgs([
    'node',
    'tooling/impact/execute.mjs',
    '--mode',
    'main',
    '--files',
    'tooling/verify/workflows.mjs',
  ]);
  assert.equal(plan.mode, 'main');
  assert.deepEqual(plan.changedPaths, ['tooling/verify/workflows.mjs']);
  assert.ok(plan.validationScopes.includes('workflow-contracts'));
  assert.equal(plan.validationScopes.includes('consumer-all'), false);
});
