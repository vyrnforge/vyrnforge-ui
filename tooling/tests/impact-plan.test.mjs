import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyPath, createPlan } from '../impact/plan.mjs';

test('component port changes select package and component evidence without sibling component evidence', () => {
  const plan = createPlan(['packages/react/src/button.ts']);
  assert.ok(plan.directNodes.includes('react'));
  assert.ok(plan.directNodes.includes('component:button:react'));
  assert.ok(plan.affectedNodes.includes('component:button:documentation'));
  assert.ok(plan.validationScopes.includes('component:button:react:ssr'));
  assert.ok(plan.validationScopes.includes('component:button:react:browser'));
  assert.ok(!plan.validationScopes.includes('component:button:angular:ssr'));
  assert.ok(!plan.validationScopes.includes('component:button:vue:ssr'));
});

test('shared component web changes fan out through every registered port', () => {
  const plan = createPlan(['packages/web/src/styles/button.css']);
  for (const node of ['component:button:web', 'component:button:react', 'component:button:angular', 'component:button:vue', 'component:button:documentation']) {
    assert.ok(plan.affectedNodes.includes(node), node);
  }
  for (const scope of ['component:button:web:browser', 'component:button:react:ssr', 'component:button:angular:ssr', 'component:button:vue:ssr']) {
    assert.ok(plan.validationScopes.includes(scope), scope);
  }
});

test('component documentation paths select docs evidence without unrelated package consumers', () => {
  const plan = createPlan(['examples/button/basic/react.tsx']);
  assert.ok(plan.directNodes.includes('documentation'));
  assert.ok(plan.directNodes.includes('component:button:documentation'));
  assert.equal(plan.broadened, false);
  assert.ok(plan.validationScopes.includes('docs-build'));
  assert.ok(plan.validationScopes.includes('browser-docs-chromium'));
  assert.ok(!plan.validationScopes.includes('build-angular'));
});

test('port-local package changes remain scoped to that port plus dependent documentation', () => {
  const plan = createPlan(['packages/react/src/index.ts']);
  assert.ok(plan.affectedNodes.includes('react'));
  assert.ok(plan.affectedNodes.includes('component:button:react'));
  assert.ok(plan.affectedNodes.includes('documentation'));
  assert.ok(!plan.validationScopes.includes('build-angular'));
});

test('web changes fan out to framework ports, registered component ports, and documentation', () => {
  const plan = createPlan(['packages/web/src/styles.css']);
  for (const node of ['angular', 'documentation', 'elements', 'react', 'vue', 'web', 'component:button:web', 'component:button:react', 'component:button:angular', 'component:button:vue']) {
    assert.ok(plan.affectedNodes.includes(node), node);
  }
});

test('core changes fan out through the full product dependency closure', () => {
  const plan = createPlan(['packages/core/src/navigation.ts']);
  for (const node of ['angular', 'core', 'documentation', 'elements', 'react', 'vue', 'web', 'component:button:react', 'component:button:angular', 'component:button:vue']) {
    assert.ok(plan.affectedNodes.includes(node), node);
  }
});

test('documentation changes stay documentation-scoped', () => {
  const plan = createPlan(['documentation/shared/styling.html']);
  assert.deepEqual(plan.directNodes, ['documentation']);
  assert.equal(plan.broadened, false);
});

test('testing metadata and repository foundation changes fail closed', () => {
  for (const path of ['testing/components/registry.json', 'tooling/impact/plan.mjs', '.github/workflows/ci.yml', 'package.json']) {
    const plan = createPlan([path]);
    assert.equal(plan.broadened, true, path);
    for (const node of ['core', 'web', 'react', 'angular', 'vue', 'elements', 'documentation', 'tooling', 'component:button:web', 'component:button:react', 'component:button:angular', 'component:button:vue']) {
      assert.ok(plan.affectedNodes.includes(node), `${path}: ${node}`);
    }
  }
});

test('unknown repository changes fail closed', () => {
  assert.equal(createPlan(['some-unclassified-root-file.txt']).broadened, true);
});

test('legacy-only changes do not select product ports', () => {
  const plan = createPlan(['packages/legacy/archive/root/README.md']);
  assert.deepEqual(plan.affectedNodes, ['legacy']);
  assert.ok(plan.validationScopes.includes('legacy-isolation'));
  assert.ok(!plan.validationScopes.includes('build-react'));
});

test('classification exposes every matching metadata target', () => {
  assert.deepEqual(classifyPath('packages/vue/src/button.ts'), {
    nodes: ['component:button:vue', 'vue'],
    broad: false
  });
  assert.deepEqual(classifyPath('examples/button/basic/vue.ts'), {
    nodes: ['component:button:documentation', 'documentation'],
    broad: false
  });
  assert.deepEqual(classifyPath('tooling/verify/package-contracts.mjs'), {
    nodes: ['tooling'],
    broad: true
  });
});
