import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlan, createTierPlan } from '../impact/plan.mjs';

test('PR framework-local changes keep sibling framework and consumer evidence skipped', () => {
  const plan = createPlan(['packages/react/src/index.ts']);
  for (const selected of ['build-react', 'pack-react', 'consumer-react', 'docs-build', 'browser-docs-chromium', 'component:button:react:ssr', 'component:button:react:browser']) {
    assert.ok(plan.validationScopes.includes(selected), selected);
  }
  for (const skipped of ['build-angular', 'build-vue', 'build-elements', 'consumer-angular', 'consumer-vue', 'consumer-elements', 'browser-docs-cross', 'component:button:angular:ssr']) {
    assert.equal(plan.validationScopes.includes(skipped), false, skipped);
    assert.ok(plan.skippedValidationScopes.includes(skipped), skipped);
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

test('core changes fan out to all dependent ports and registered component evidence', () => {
  const plan = createPlan(['packages/core/src/index.ts']);
  for (const scope of ['consumer-core', 'consumer-web', 'consumer-react', 'consumer-angular', 'consumer-vue', 'consumer-elements', 'component:button:types', 'component:button:react:ssr']) {
    assert.ok(plan.validationScopes.includes(scope), scope);
  }
});

test('main includes all registered component evidence while scheduled adds cross-browser evidence', () => {
  const main = createTierPlan('main');
  const scheduled = createTierPlan('scheduled');
  for (const scope of ['component:button:types', 'component:button:web:browser', 'component:button:react:ssr', 'component:button:react:browser', 'component:button:angular:ssr', 'component:button:vue:ssr']) {
    assert.ok(main.validationScopes.includes(scope), scope);
  }
  assert.ok(main.validationScopes.includes('browser-docs-chromium'));
  assert.equal(main.validationScopes.includes('browser-docs-cross'), false);
  assert.equal(main.validationScopes.includes('component:button:web:browser-cross'), false);
  assert.ok(scheduled.validationScopes.includes('browser-docs-cross'));
  assert.ok(scheduled.validationScopes.includes('component:button:web:browser-cross'));
});

test('release validation is strictly broader than main validation', () => {
  const main = createTierPlan('main');
  const release = createTierPlan('release');
  for (const scope of main.validationScopes.filter((scope) => scope !== 'browser-docs-chromium')) assert.ok(release.validationScopes.includes(scope), scope);
  assert.ok(release.validationScopes.includes('browser-docs-cross'));
  assert.ok(release.validationScopes.includes('component:button:web:browser-cross'));
  assert.ok(release.validationScopes.includes('release-readiness'));
});
