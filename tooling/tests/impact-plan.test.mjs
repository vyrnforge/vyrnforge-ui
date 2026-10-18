import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyPath, createPlan } from '../impact/plan.mjs';

test('port-local changes remain scoped to the port plus dependent documentation', () => {
  const plan = createPlan(['packages/react/src/index.ts']);
  assert.deepEqual(plan.affectedNodes, ['documentation', 'react']);
  assert.equal(plan.broadened, false);
  assert.ok(plan.validationScopes.includes('build-react'));
  assert.ok(!plan.validationScopes.includes('build-angular'));
});

test('web changes fan out to every framework port and documentation', () => {
  const plan = createPlan(['packages/web/src/styles.css']);
  assert.deepEqual(plan.affectedNodes, ['angular', 'documentation', 'elements', 'react', 'vue', 'web']);
});

test('core changes fan out through the full product dependency closure', () => {
  const plan = createPlan(['packages/core/src/navigation.ts']);
  assert.deepEqual(plan.affectedNodes, ['angular', 'core', 'documentation', 'elements', 'react', 'vue', 'web']);
});

test('documentation changes stay documentation-scoped', () => {
  const plan = createPlan(['documentation/shared/styling.md']);
  assert.deepEqual(plan.affectedNodes, ['documentation']);
  assert.equal(plan.broadened, false);
});

test('impact-engine and repository foundation changes fail closed', () => {
  for (const path of ['tooling/impact/plan.mjs', '.github/workflows/ci.yml', 'package.json']) {
    const plan = createPlan([path]);
    assert.equal(plan.broadened, true, path);
    for (const node of ['core', 'web', 'react', 'angular', 'vue', 'elements', 'documentation', 'tooling']) {
      assert.ok(plan.affectedNodes.includes(node), `${path}: ${node}`);
    }
  }
});

test('unknown repository changes fail closed', () => {
  const plan = createPlan(['some-unclassified-root-file.txt']);
  assert.equal(plan.broadened, true);
});

test('legacy-only changes do not select product ports', () => {
  const plan = createPlan(['packages/legacy/archive/root/README.md']);
  assert.deepEqual(plan.affectedNodes, ['legacy']);
  assert.ok(plan.validationScopes.includes('legacy-isolation'));
  assert.ok(!plan.validationScopes.includes('build-react'));
});

test('classification exposes whether a path forces broad validation', () => {
  assert.deepEqual(classifyPath('packages/vue/src/index.ts'), { node: 'vue', broad: false });
  assert.deepEqual(classifyPath('tooling/verify/package-contracts.mjs'), { node: 'tooling', broad: true });
});
