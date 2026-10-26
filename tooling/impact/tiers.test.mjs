import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlan, createTierPlan } from '../impact/plan.mjs';
import { createExecutionPlan, validationPlanFromArgs } from '../impact/execute.mjs';

test('PR component-local changes keep package consumers and sibling framework evidence skipped', () => {
  const plan = createPlan(['packages/react/src/components/button/index.ts']);
  for (const selected of ['component:button:react:types', 'component:button:react:ssr', 'component:button:react:browser']) assert.ok(plan.validationScopes.includes(selected), selected);
  for (const skipped of ['pack-react', 'consumer-react', 'pack-angular', 'consumer-angular', 'component:button:angular:ssr', 'component-types-all', 'component-ssr-all', 'browser-docs-cross', 'bundle-baselines']) assert.equal(plan.validationScopes.includes(skipped), false, skipped);
  const execution = createExecutionPlan(plan);
  assert.ok(execution.some((entry) => entry.scope === 'build-react'));
  assert.equal(execution.some((entry) => entry.scope === 'pack-react'), false);
  assert.equal(execution.some((entry) => entry.scope === 'consumer-react'), false);
  assert.equal(execution.some((entry) => entry.scope === 'build-angular'), false);
});

test('genuinely broad PRs batch exhaustive type and SSR evidence', () => {
  const plan = createPlan(['package-lock.json']);
  assert.equal(plan.broadened, true);
  assert.ok(plan.validationScopes.includes('component-types-all'));
  assert.ok(plan.validationScopes.includes('component-ssr-all'));
  for (const replaced of ['component:button:conformance:types', 'component:button:react:types', 'component:button:react:ssr']) {
    assert.equal(plan.validationScopes.includes(replaced), false, replaced);
  }
  assert.deepEqual(plan.scopeReasons['component-types-all'], ['batched exhaustive type evidence for broadened PR']);
  assert.deepEqual(plan.scopeReasons['component-ssr-all'], ['batched exhaustive SSR evidence for broadened PR']);
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

test('main workflow mode can use the same changed-path impact plan as PR validation', () => {
  const main = validationPlanFromArgs(['node', 'execute.mjs', '--mode', 'main', '--files', 'packages/react/src/components/button/index.ts']);
  assert.equal(main.mode, 'main');
  assert.equal(main.broadened, false);
  for (const selected of ['component:button:react:types', 'component:button:react:ssr', 'component:button:react:browser']) assert.ok(main.validationScopes.includes(selected), selected);
  for (const skipped of ['pack-react', 'consumer-react', 'consumer-all', 'component-types-all', 'component-ssr-all', 'component:button:angular:ssr', 'component:button:vue:browser']) assert.equal(main.validationScopes.includes(skipped), false, skipped);
});

test('explicit broad main tier remains available for manual exhaustive validation', () => {
  const main = createTierPlan('main');
  for (const scope of ['change-fragments', 'changes-preview', 'pack-react', 'consumer-all', 'bundle-baselines', 'browser-foundation-visual', 'component-types-all', 'component-ssr-all', 'component:button:web:browser', 'component:button:react:browser']) assert.ok(main.validationScopes.includes(scope), scope);
  for (const replaced of ['component:button:conformance:types', 'component:button:react:types', 'component:button:react:ssr', 'component:button:angular:ssr', 'component:button:vue:ssr']) assert.equal(main.validationScopes.includes(replaced), false, replaced);
  assert.equal(main.validationScopes.includes('component:button:web:browser-cross'), false);
  const execution = createExecutionPlan(main);
  assert.deepEqual(execution.find((entry) => entry.scope === 'component-types-all')?.command, ['node', 'tooling/testing/check-component-types-batch.mjs']);
  assert.deepEqual(execution.find((entry) => entry.scope === 'component-ssr-all')?.command, ['node', 'tooling/testing/run-component-ssr-batch.mjs']);
});

test('scheduled and release add cross-browser evidence, release adds readiness', () => {
  const scheduled = createTierPlan('scheduled');
  const release = createTierPlan('release');
  for (const plan of [scheduled, release]) {
    assert.ok(plan.validationScopes.includes('component-types-all'));
    assert.ok(plan.validationScopes.includes('component-ssr-all'));
  }
  assert.ok(scheduled.validationScopes.includes('component:button:web:browser-cross'));
  assert.ok(scheduled.validationScopes.includes('browser-docs-cross'));
  assert.ok(scheduled.validationScopes.includes('browser-foundation-visual'));
  assert.ok(scheduled.validationScopes.includes('bundle-baselines'));
  assert.ok(release.validationScopes.includes('component:button:web:browser-cross'));
  assert.ok(release.validationScopes.includes('browser-foundation-visual'));
  assert.ok(release.validationScopes.includes('bundle-baselines'));
  assert.ok(release.validationScopes.includes('release-readiness'));
});
