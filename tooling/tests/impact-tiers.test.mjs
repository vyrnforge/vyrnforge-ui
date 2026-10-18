import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlan, createTierPlan } from '../impact/plan.mjs';

const frameworkBuildScopes = ['build-react', 'build-angular', 'build-vue', 'build-elements'];

test('PR framework-local changes do not select sibling framework package evidence', () => {
  const plan = createPlan(['packages/react/src/index.ts']);
  assert.ok(plan.validationScopes.includes('build-react'));
  assert.ok(plan.validationScopes.includes('docs-build'));
  for (const scope of ['build-angular', 'build-vue', 'build-elements']) {
    assert.equal(plan.validationScopes.includes(scope), false, `${scope} should remain skipped`);
    assert.ok(plan.skippedValidationScopes.includes(scope));
  }
});

test('documentation-local changes select docs evidence without package pack scopes', () => {
  const plan = createPlan(['documentation/shared/styling.html']);
  assert.ok(plan.validationScopes.includes('docs-build'));
  assert.ok(plan.validationScopes.includes('docs-site'));
  assert.equal(plan.validationScopes.includes('pack-react'), false);
});

test('main validation deliberately covers all package builds and consumer verification', () => {
  const plan = createTierPlan('main');
  for (const scope of [...frameworkBuildScopes, 'build-core', 'build-web', 'docs-site', 'consumer-packages']) {
    assert.ok(plan.validationScopes.includes(scope));
  }
});

test('release validation is strictly broader than main validation', () => {
  const main = createTierPlan('main');
  const release = createTierPlan('release');
  for (const scope of main.validationScopes) assert.ok(release.validationScopes.includes(scope));
  assert.ok(release.validationScopes.includes('release-readiness'));
});
