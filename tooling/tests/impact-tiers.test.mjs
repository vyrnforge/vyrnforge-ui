import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlan, createTierPlan } from '../impact/plan.mjs';

test('PR framework-local changes keep sibling framework and consumer evidence skipped', () => {
  const plan = createPlan(['packages/react/src/index.ts']);
  for (const selected of ['build-react', 'pack-react', 'consumer-react', 'docs-build', 'browser-docs-chromium']) assert.ok(plan.validationScopes.includes(selected));
  for (const skipped of ['build-angular', 'build-vue', 'build-elements', 'consumer-angular', 'consumer-vue', 'consumer-elements', 'browser-docs-cross']) {
    assert.equal(plan.validationScopes.includes(skipped), false);
    assert.ok(plan.skippedValidationScopes.includes(skipped));
  }
});

test('documentation-local changes select docs and chromium browser evidence without package consumers', () => {
  const plan = createPlan(['documentation/shared/styling.html']);
  assert.ok(plan.validationScopes.includes('docs-build'));
  assert.ok(plan.validationScopes.includes('docs-site'));
  assert.ok(plan.validationScopes.includes('browser-docs-chromium'));
  assert.equal(plan.validationScopes.includes('consumer-react'), false);
  assert.equal(plan.validationScopes.includes('browser-docs-cross'), false);
});

test('core changes fan out to all dependent ports and consumers', () => {
  const plan = createPlan(['packages/core/src/index.ts']);
  for (const scope of ['consumer-core', 'consumer-web', 'consumer-react', 'consumer-angular', 'consumer-vue', 'consumer-elements']) assert.ok(plan.validationScopes.includes(scope));
});

test('main uses chromium browser evidence while scheduled uses cross-browser evidence', () => {
  const main = createTierPlan('main');
  const scheduled = createTierPlan('scheduled');
  assert.ok(main.validationScopes.includes('browser-docs-chromium'));
  assert.equal(main.validationScopes.includes('browser-docs-cross'), false);
  assert.ok(scheduled.validationScopes.includes('browser-docs-cross'));
});

test('release validation is strictly broader than main validation', () => {
  const main = createTierPlan('main');
  const release = createTierPlan('release');
  for (const scope of main.validationScopes.filter((scope) => scope !== 'browser-docs-chromium')) assert.ok(release.validationScopes.includes(scope));
  assert.ok(release.validationScopes.includes('browser-docs-cross'));
  assert.ok(release.validationScopes.includes('release-readiness'));
});
