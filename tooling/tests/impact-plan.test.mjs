import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyPath, createPlan } from '../impact/plan.mjs';

test('React Button changes select React Button evidence without unrelated framework Button evidence', () => {
  const plan = createPlan(['packages/react/src/button.ts']);
  assert.ok(plan.affectedNodes.includes('button-react'));
  assert.ok(plan.affectedNodes.includes('button-documentation'));
  assert.ok(plan.validationScopes.includes('button-react-ssr'));
  assert.ok(plan.validationScopes.includes('button-browser-react'));
  assert.ok(!plan.validationScopes.includes('button-angular-ssr'));
  assert.ok(!plan.validationScopes.includes('button-browser-angular'));
  assert.ok(!plan.validationScopes.includes('button-vue-ssr'));
});

test('shared Button CSS fans out through every implemented Button port', () => {
  const plan = createPlan(['packages/web/src/styles/button.css']);
  for (const node of ['button-web', 'button-react', 'button-angular', 'button-vue', 'button-documentation']) assert.ok(plan.affectedNodes.includes(node), node);
  for (const scope of ['button-browser-web', 'button-react-ssr', 'button-angular-ssr', 'button-vue-ssr']) assert.ok(plan.validationScopes.includes(scope), scope);
});

test('port-local changes remain scoped to the port plus dependent documentation', () => {
  const plan = createPlan(['packages/react/src/index.ts']);
  assert.ok(plan.affectedNodes.includes('react'));
  assert.ok(plan.affectedNodes.includes('documentation'));
  assert.ok(!plan.validationScopes.includes('build-angular'));
});

test('web changes fan out to every framework port and documentation', () => {
  const plan = createPlan(['packages/web/src/styles.css']);
  for (const node of ['angular', 'documentation', 'elements', 'react', 'vue', 'web']) assert.ok(plan.affectedNodes.includes(node), node);
});

test('core changes fan out through the full product dependency closure', () => {
  const plan = createPlan(['packages/core/src/navigation.ts']);
  for (const node of ['angular', 'core', 'documentation', 'elements', 'react', 'vue', 'web']) assert.ok(plan.affectedNodes.includes(node), node);
});

test('documentation changes stay documentation-scoped', () => {
  const plan = createPlan(['documentation/shared/styling.html']);
  assert.deepEqual(plan.directNodes, ['documentation']);
  assert.equal(plan.broadened, false);
});

test('impact-engine and repository foundation changes fail closed', () => {
  for (const path of ['tooling/impact/plan.mjs', '.github/workflows/ci.yml', 'package.json']) {
    const plan = createPlan([path]);
    assert.equal(plan.broadened, true, path);
    for (const node of ['core', 'web', 'react', 'angular', 'vue', 'elements', 'documentation', 'tooling', 'button-web', 'button-react', 'button-angular', 'button-vue', 'button-documentation']) assert.ok(plan.affectedNodes.includes(node), `${path}: ${node}`);
  }
});

test('unknown repository changes fail closed', () => { assert.equal(createPlan(['some-unclassified-root-file.txt']).broadened, true); });
test('legacy-only changes do not select product ports', () => { const plan = createPlan(['packages/legacy/archive/root/README.md']); assert.deepEqual(plan.affectedNodes, ['legacy']); assert.ok(plan.validationScopes.includes('legacy-isolation')); assert.ok(!plan.validationScopes.includes('build-react')); });
test('classification exposes component scopes and broad infrastructure', () => { assert.deepEqual(classifyPath('packages/vue/src/button.ts'), { node: 'button-vue', broad: false }); assert.deepEqual(classifyPath('tooling/verify/package-contracts.mjs'), { node: 'tooling', broad: true }); });
