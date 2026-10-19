import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyPath, createPlan } from '../impact/plan.mjs';

test('component subpath changes suppress the aggregate package owner', () => {
  const plan = createPlan(['packages/react/src/components/button/index.ts']);
  assert.deepEqual(plan.directNodes, ['component:button:react']);
  assert.equal(plan.broadened, false);
  for (const scope of ['pack-react', 'consumer-react', 'component:button:react:types', 'component:button:react:ssr', 'component:button:react:browser']) assert.ok(plan.validationScopes.includes(scope), scope);
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
});

test('shared Web component changes fan out through every discovered port', () => {
  const plan = createPlan(['packages/web/src/components/button/button.css']);
  assert.deepEqual(plan.directNodes, ['component:button:web']);
  for (const node of ['component:button:web', 'component:button:react', 'component:button:angular', 'component:button:vue', 'component:button:conformance', 'component:button:documentation']) assert.ok(plan.affectedNodes.includes(node), node);
  for (const scope of ['component:button:web:browser', 'component:button:react:ssr', 'component:button:angular:ssr', 'component:button:vue:ssr', 'docs-build']) assert.ok(plan.validationScopes.includes(scope), scope);
});

test('component docs and examples are owned by component documentation, not global package aggregates', () => {
  const plan = createPlan(['components/button/examples/basic/react.tsx']);
  assert.deepEqual(plan.directNodes, ['component:button:documentation']);
  assert.equal(plan.broadened, false);
  assert.ok(plan.validationScopes.includes('docs-build'));
  assert.ok(!plan.validationScopes.includes('pack-angular'));
});

test('package-root changes fan out to every dependent surface in that package', () => {
  const plan = createPlan(['packages/react/src/index.ts']);
  assert.deepEqual(plan.directNodes, ['react']);
  assert.ok(plan.affectedNodes.includes('component:button:react'));
  assert.ok(plan.affectedNodes.includes('documentation'));
  assert.ok(plan.validationScopes.includes('consumer-react'));
  assert.ok(plan.validationScopes.includes('docs-build'));
});

test('web and core aggregate changes retain broad dependency closure', () => {
  const web = createPlan(['packages/web/src/styles.css']);
  for (const node of ['web', 'react', 'angular', 'vue', 'elements', 'component:button:web', 'component:button:react']) assert.ok(web.affectedNodes.includes(node), node);
  const core = createPlan(['packages/core/src/index.ts']);
  for (const node of ['core', 'web', 'react', 'angular', 'vue', 'elements', 'component:button:web', 'component:button:react']) assert.ok(core.affectedNodes.includes(node), node);
});

test('change fragments stay owner scoped while syntax validation remains global', () => {
  const plan = createPlan(['components/button/changes/2026-10-19-scoped-product-units.md']);
  assert.deepEqual(plan.directNodes, ['component:button:changes']);
  assert.ok(plan.validationScopes.includes('change-fragments'));
  assert.ok(!plan.validationScopes.includes('pack-react'));
});

test('documentation and unknown paths keep safe behavior', () => {
  assert.deepEqual(createPlan(['documentation/shared/styling.html']).directNodes, ['documentation']);
  assert.equal(createPlan(['some-unclassified-root-file.txt']).broadened, true);
});

test('testing discovery and repository foundation changes fail closed', () => {
  for (const file of ['tooling/testing/discover-product-units.mjs', 'testing/impact.json', 'tooling/impact/plan.mjs', '.github/workflows/ci.yml', 'package.json']) assert.equal(createPlan([file]).broadened, true, file);
});

test('legacy-only changes remain isolated', () => {
  const plan = createPlan(['packages/legacy/archive/root/README.md']);
  assert.deepEqual(plan.affectedNodes, ['legacy']);
  assert.ok(!plan.validationScopes.includes('pack-react'));
});

test('classification returns the most specific owner', () => {
  assert.deepEqual(classifyPath('packages/vue/src/components/button/index.ts'), { nodes: ['component:button:vue'], broad: false });
  assert.deepEqual(classifyPath('components/button/docs/index.html'), { nodes: ['component:button:documentation'], broad: false });
  assert.deepEqual(classifyPath('packages/vue/src/index.ts'), { nodes: ['vue'], broad: false });
  assert.deepEqual(classifyPath('tooling/verify/package-contracts.mjs'), { nodes: ['tooling'], broad: true });
});
