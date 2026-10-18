import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlan, createTierPlan } from '../impact/plan.mjs';

test('PR framework-local changes keep sibling framework and consumer evidence skipped', () => {
  const plan = createPlan(['packages/react/src/index.ts']);
  for (const selected of ['build-react', 'pack-react', 'consumer-react', 'docs-build']) assert.ok(plan.validationScopes.includes(selected));
  for (const skipped of ['build-angular', 'build-vue', 'build-elements', 'consumer-angular', 'consumer-vue', 'consumer-elements']) {
    assert.equal(plan.validationScopes.includes(skipped), false);
    assert.ok(plan.skippedValidationScopes.includes(skipped));
  }
});

test('documentation-local changes select docs evidence without package consumers', () => {
  const plan = createPlan(['documentation/shared/styling.html']);
  assert.ok(plan.validationScopes.includes('docs-build'));
  assert.ok(plan.validationScopes.includes('docs-site'));
  assert.equal(plan.validationScopes.includes('consumer-react'), false);
});

test('core changes fan out to all dependent ports and consumers', () => {
  const plan = createPlan(['packages/core/src/index.ts']);
  for (const scope of ['consumer-core', 'consumer-web', 'consumer-react', 'consumer-angular', 'consumer-vue', 'consumer-elements']) assert.ok(plan.validationScopes.includes(scope));
});

test('main validation deliberately uses one aggregate consumer verification', () => {
  const plan = createTierPlan('main');
  assert.ok(plan.validationScopes.includes('consumer-all'));
  assert.equal(plan.validationScopes.includes('consumer-react'), false);
});

test('release validation is strictly broader than main validation', () => {
  const main = createTierPlan('main');
  const release = createTierPlan('release');
  for (const scope of main.validationScopes) assert.ok(release.validationScopes.includes(scope));
  assert.ok(release.validationScopes.includes('release-readiness'));
});
