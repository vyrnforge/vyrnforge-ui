import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlan, createTierPlan } from '../impact/plan.mjs';
import { createExecutionPlan } from '../impact/execute.mjs';

test('PR component-local changes keep sibling framework evidence skipped', () => {
  const plan = createPlan(['packages/react/src/components/button/index.ts']);
  for (const selected of ['pack-react', 'consumer-react', 'component:button:react:types', 'component:button:react:ssr', 'component:button:react:browser']) assert.ok(plan.validationScopes.includes(selected), selected);
  for (const skipped of ['pack-angular', 'consumer-angular', 'component:button:angular:ssr', 'browser-docs-cross', 'bundle-baselines']) assert.equal(plan.validationScopes.includes(skipped), false, skipped);
  const execution = createExecutionPlan(plan);
  assert.ok(execution.some((entry) => entry.scope === 'build-react'));
  assert.equal(execution.some((entry) => entry.scope === 'build-angular'), false);
});

test('documentation-local changes select docs without package consumers', () => {
  const plan = createPlan(['documentation/shared/styling.html']);
  for (const scope of ['docs-build', 'docs-site', 'browser-docs-chromium']) assert.ok(plan.validationScopes.includes(scope), scope);
  assert.equal(plan.validationScopes.includes('consumer-react'), false);
});

test('Web foundation changes include the shared visual regression baseline', () => {
  const plan = createPlan(['packages/web/src/styles/tokens.css']);
  assert.ok(plan.validationScopes.includes('browser-foundation-visual'));
});

test('main includes all discovered package-local and shared component evidence', () => {
  const main = createTierPlan('main');
  for (const scope of ['change-fragments', 'changes-preview', 'bundle-baselines', 'browser-foundation-visual', 'component:button:conformance:types', 'component:button:react:types', 'component:button:react:ssr', 'component:button:web:browser', 'component:button:angular:ssr', 'component:button:vue:ssr']) assert.ok(main.validationScopes.includes(scope), scope);
  assert.equal(main.validationScopes.includes('component:button:web:browser-cross'), false);
});

test('scheduled and release add cross-browser evidence, release adds readiness', () => {
  const scheduled = createTierPlan('scheduled');
  const release = createTierPlan('release');
  assert.ok(scheduled.validationScopes.includes('component:button:web:browser-cross'));
  assert.ok(scheduled.validationScopes.includes('browser-docs-cross'));
  assert.ok(scheduled.validationScopes.includes('browser-foundation-visual'));
  assert.ok(scheduled.validationScopes.includes('bundle-baselines'));
  assert.ok(release.validationScopes.includes('component:button:web:browser-cross'));
  assert.ok(release.validationScopes.includes('browser-foundation-visual'));
  assert.ok(release.validationScopes.includes('bundle-baselines'));
  assert.ok(release.validationScopes.includes('release-readiness'));
});
