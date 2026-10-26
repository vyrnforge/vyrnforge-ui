import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyPath, createPlan } from '../impact/plan.mjs';

test('component subpath changes suppress the aggregate package owner', () => {
  const plan = createPlan(['packages/react/src/components/button/index.ts']);
  assert.deepEqual(plan.directNodes, ['component:button:react']);
  assert.equal(plan.broadened, false);
  for (const scope of ['component:button:react:types', 'component:button:react:ssr', 'component:button:react:browser']) assert.ok(plan.validationScopes.includes(scope), scope);
  for (const scope of ['pack-react', 'consumer-react', 'package-contracts']) assert.equal(plan.validationScopes.includes(scope), false, scope);
  assert.ok(!plan.affectedNodes.includes('component:button:conformance'));
  assert.ok(!plan.affectedNodes.includes('component:button:documentation'));
  assert.ok(!plan.validationScopes.includes('component:button:angular:ssr'));
  assert.ok(!plan.validationScopes.includes('docs-build'));
});

test('package-local evidence remains scoped to its component port', () => {
  const plan = createPlan(['packages/react/test/components/button/ssr.test.mjs']);
  assert.deepEqual(plan.directNodes, ['component:button:react']);
  assert.equal(plan.broadened, false);
  assert.ok(plan.validationScopes.includes('component:button:react:ssr'));
  assert.ok(!plan.validationScopes.includes('component:button:vue:ssr'));
  assert.ok(!plan.validationScopes.includes('consumer-react'));
});

test('shared component CSS selects style and browser evidence without package or type fan-out', () => {
  const plan = createPlan(['packages/web/src/components/button/button.css']);
  assert.deepEqual(plan.directNodes, ['component:button:web-style']);
  assert.equal(plan.broadened, false);
  for (const scope of ['lint-web-css', 'component:button:web:browser', 'component:button:react:browser', 'component:button:angular:browser', 'component:button:vue:browser']) assert.ok(plan.validationScopes.includes(scope), scope);
  for (const scope of ['pack-web', 'consumer-web', 'component:button:react:types', 'component:button:react:ssr', 'component:button:angular:ssr', 'component:button:vue:ssr', 'pack-react', 'pack-angular', 'pack-vue', 'docs-build']) assert.equal(plan.validationScopes.includes(scope), false, scope);
});

test('renderer-neutral capability changes select only actual Tabs consumers and their evidence', () => {
  const plan = createPlan(['packages/core/src/capabilities/collection-navigation/index.ts']);
  assert.deepEqual(plan.directNodes, ['unit:core:capabilities:collection-navigation']);
  assert.equal(plan.broadened, false);
  for (const node of ['component:tabs:react', 'component:tabs:angular', 'component:tabs:vue']) assert.ok(plan.affectedNodes.includes(node), node);
  for (const scope of ['unit:core:capabilities:collection-navigation:test', 'component:tabs:react:browser', 'component:tabs:angular:browser', 'component:tabs:vue:browser']) assert.ok(plan.validationScopes.includes(scope), scope);
  for (const scope of ['pack-core', 'consumer-core']) assert.equal(plan.validationScopes.includes(scope), false, scope);
  for (const node of ['component:button:react', 'component:button:angular', 'component:button:vue']) assert.ok(!plan.affectedNodes.includes(node), node);
});

test('a React Tabs implementation change stays within the React/component boundary', () => {
  const plan = createPlan(['packages/react/src/components/tabs/index.ts']);
  assert.deepEqual(plan.directNodes, ['component:tabs:react']);
  assert.equal(plan.broadened, false);
  for (const scope of ['component:tabs:react:types', 'component:tabs:react:ssr', 'component:tabs:react:browser']) assert.ok(plan.validationScopes.includes(scope), scope);
  for (const scope of ['pack-react', 'consumer-react', 'component:tabs:angular:ssr', 'component:tabs:vue:ssr']) assert.equal(plan.validationScopes.includes(scope), false, scope);
});

test('component docs and examples use component-local documentation evidence', () => {
  const plan = createPlan(['components/button/examples/basic/react.tsx']);
  assert.deepEqual(plan.directNodes, ['component:button:documentation']);
  assert.equal(plan.broadened, false);
  assert.ok(plan.validationScopes.includes('component:button:docs'));
  assert.ok(plan.validationScopes.includes('docs-source'));
  assert.ok(!plan.validationScopes.includes('docs-build'));
  assert.ok(!plan.validationScopes.includes('pack-angular'));
});

test('shared documentation changes retain the full documentation gate', () => {
  const plan = createPlan(['documentation/shared/styling.html']);
  assert.deepEqual(plan.directNodes, ['documentation']);
  for (const scope of ['lint-docs', 'docs-source', 'docs-build', 'docs-site', 'browser-docs-chromium']) assert.ok(plan.validationScopes.includes(scope), scope);
});

test('package public surfaces validate the package without marking every component affected', () => {
  for (const file of ['packages/react/src/index.ts', 'packages/react/package.json']) {
    const plan = createPlan([file]);
    assert.deepEqual(plan.directNodes, ['package:react:public-surface']);
    assert.equal(plan.broadened, false);
    for (const scope of ['package-contracts', 'pack-react', 'consumer-react']) assert.ok(plan.validationScopes.includes(scope), `${file}: ${scope}`);
    for (const node of ['component:button:react', 'component:tabs:react', 'documentation']) assert.ok(!plan.affectedNodes.includes(node), `${file}: ${node}`);
    assert.ok(!plan.validationScopes.includes('docs-build'));
  }
});

test('Web aggregate stylesheet validates the Web package without component fan-out', () => {
  const plan = createPlan(['packages/web/src/styles.css']);
  assert.deepEqual(plan.directNodes, ['web:aggregate-style']);
  assert.equal(plan.broadened, false);
  for (const scope of ['lint-web-css', 'pack-web', 'consumer-web']) assert.ok(plan.validationScopes.includes(scope), scope);
  for (const node of ['component:button:web', 'component:button:react', 'react', 'angular', 'vue']) assert.ok(!plan.affectedNodes.includes(node), node);
});

test('representative bundle baseline data selects only bundle baseline evidence', () => {
  const plan = createPlan(['tooling/performance/representative-bundle-baselines.json']);
  assert.deepEqual(plan.directNodes, ['performance:bundle-baselines']);
  assert.equal(plan.broadened, false);
  assert.ok(plan.validationScopes.includes('bundle-baselines'));
  assert.ok(!plan.validationScopes.includes('docs-build'));
});

test('a normal component addition surface remains targeted rather than broad', () => {
  const plan = createPlan([
    'components/textarea/docs/index.html',
    'components/textarea/examples/basic/react.tsx',
    'packages/react/package.json',
    'packages/react/src/index.ts',
    'packages/react/src/components/textarea/index.ts',
    'packages/angular/package.json',
    'packages/angular/src/index.ts',
    'packages/angular/src/components/textarea/index.ts',
    'packages/vue/package.json',
    'packages/vue/src/index.ts',
    'packages/vue/src/components/textarea/index.ts',
    'packages/web/package.json',
    'packages/web/src/styles.css',
    'packages/web/src/components/textarea/textarea.css',
    'tooling/performance/representative-bundle-baselines.json',
  ]);
  assert.equal(plan.broadened, false);
  assert.ok(plan.validationScopes.includes('component:textarea:docs'));
  assert.ok(plan.validationScopes.includes('bundle-baselines'));
  assert.ok(!plan.validationScopes.includes('docs-build'));
  for (const scope of ['component:button:react:types', 'component:tabs:react:ssr', 'component:dialog:vue:browser']) assert.ok(!plan.validationScopes.includes(scope), scope);
});

test('true package implementation changes still retain dependency closure', () => {
  const core = createPlan(['packages/core/src/some-shared-runtime.ts']);
  assert.deepEqual(core.directNodes, ['core']);
  for (const node of ['core', 'web', 'react', 'angular', 'vue', 'elements']) assert.ok(core.affectedNodes.includes(node), node);
});

test('change fragments stay owner scoped while syntax validation remains global', () => {
  const plan = createPlan(['components/button/changes/2026-10-19-scoped-product-units.md']);
  assert.deepEqual(plan.directNodes, ['component:button:changes']);
  assert.ok(plan.validationScopes.includes('change-fragments'));
  assert.ok(!plan.validationScopes.includes('pack-react'));
});

test('narrow PRs keep expensive readiness and impact checks out of the global sentinel set', () => {
  const plan = createPlan(['components/button/changes/2026-10-19-scoped-product-units.md']);
  for (const scope of ['impact-engine', 'foundation-readiness', 'l1-readiness', 'l2-readiness']) assert.equal(plan.validationScopes.includes(scope), false, scope);
  assert.deepEqual(plan.scopeReasons['change-fragments'], ['global sentinel', 'evidence for component:button:changes']);
});

test('documentation and unknown paths keep safe behavior', () => {
  assert.deepEqual(createPlan(['documentation/shared/styling.html']).directNodes, ['documentation']);
  assert.equal(createPlan(['some-unclassified-root-file.txt']).broadened, true);
});

test('owned CI and impact-engine changes stay scoped to their contract evidence', () => {
  const workflows = createPlan(['.github/workflows/ci.yml']);
  assert.deepEqual(workflows.directNodes, ['ci-workflows']);
  assert.equal(workflows.broadened, false);
  assert.ok(workflows.validationScopes.includes('workflow-contracts'));
  assert.equal(workflows.validationScopes.includes('component-types-all'), false);
  assert.equal(workflows.validationScopes.includes('component:button:react:browser'), false);

  for (const file of ['tooling/impact/plan.mjs', 'testing/impact.json', 'tooling/testing/discover-product-units.mjs']) {
    const plan = createPlan([file]);
    assert.deepEqual(plan.directNodes, ['impact-engine'], file);
    assert.equal(plan.broadened, false, file);
    for (const scope of ['lint-tooling', 'impact-engine']) assert.ok(plan.validationScopes.includes(scope), `${file}: ${scope}`);
    assert.equal(plan.validationScopes.includes('component-types-all'), false, file);
    assert.equal(plan.validationScopes.includes('component:button:react:browser'), false, file);
  }
});

test('unknown repository foundations still fail closed', () => {
  for (const file of ['package.json', '.github/CODEOWNERS', 'testing/unowned-fixture.mjs', 'tooling/unowned-script.mjs']) {
    const plan = createPlan([file]);
    assert.equal(plan.broadened, true, file);
    assert.ok(plan.validationScopes.includes('impact-engine'), `${file}: impact-engine`);
  }
});

test('legacy-only changes remain isolated', () => {
  const plan = createPlan(['packages/legacy/archive/root/README.md']);
  assert.deepEqual(plan.affectedNodes, ['legacy']);
  assert.ok(!plan.validationScopes.includes('pack-react'));
});

test('classification returns the most specific owner', () => {
  assert.deepEqual(classifyPath('packages/web/src/components/button/button.css'), { nodes: ['component:button:web-style'], broad: false });
  assert.deepEqual(classifyPath('packages/vue/src/components/button/index.ts'), { nodes: ['component:button:vue'], broad: false });
  assert.deepEqual(classifyPath('components/button/docs/index.html'), { nodes: ['component:button:documentation'], broad: false });
  assert.deepEqual(classifyPath('packages/vue/src/index.ts'), { nodes: ['package:vue:public-surface'], broad: false });
  assert.deepEqual(classifyPath('packages/web/src/styles.css'), { nodes: ['web:aggregate-style'], broad: false });
  assert.deepEqual(classifyPath('tooling/performance/representative-bundle-baselines.json'), { nodes: ['performance:bundle-baselines'], broad: false });
  assert.deepEqual(classifyPath('tooling/impact/plan.mjs'), { nodes: ['impact-engine'], broad: false });
  assert.deepEqual(classifyPath('.github/workflows/ci.yml'), { nodes: ['ci-workflows'], broad: false });
  assert.deepEqual(classifyPath('tooling/verify/workflows.mjs'), { nodes: ['workflow-contracts'], broad: false });
  assert.deepEqual(classifyPath('tooling/verify/package-contracts.mjs'), { nodes: ['tooling'], broad: true });
});
