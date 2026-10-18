import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlan } from '../impact/plan.mjs';

test('port-local changes remain scoped', () => {
  const plan = createPlan(['packages/react/src/index.ts']);
  assert.deepEqual(plan.affectedNodes, ['react']);
  assert.equal(plan.broadened, false);
});

test('core changes fan out through the product dependency graph', () => {
  const plan = createPlan(['packages/core/src/navigation.ts']);
  assert.deepEqual(plan.affectedNodes, ['angular', 'core', 'elements', 'react', 'vue', 'web']);
});

test('unknown repository changes fail closed', () => {
  const plan = createPlan(['some-unclassified-root-file.txt']);
  assert.equal(plan.broadened, true);
  for (const node of ['core', 'web', 'react', 'angular', 'vue', 'elements', 'documentation', 'tooling']) {
    assert.ok(plan.affectedNodes.includes(node));
  }
});

test('legacy-only changes do not select product ports', () => {
  const plan = createPlan(['packages/legacy/archive/root/README.md']);
  assert.deepEqual(plan.affectedNodes, ['legacy']);
  assert.ok(plan.validationScopes.includes('legacy-isolation'));
});
