import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { createSemanticImpact } from './plan.mjs';

test('canonical product-unit framework source remains port-local without unrelated Native docs evidence', () => {
  const discovery = {
    packages: [{ name: 'react', manifest: {} }],
    components: [{
      component: 'button',
      status: 'implemented',
      root: 'product/components/interactive-controls/button/',
      roots: ['product/components/interactive-controls/button/'],
      ports: {
        react: {
          paths: ['product/components/interactive-controls/button/react/'],
          browser: true,
          dependencies: [],
          types: null,
          ssr: null,
        },
      },
      metadataPath: 'product/components/interactive-controls/button/component.json',
      documentationGroup: 'actions',
    }],
    ownedUnits: [],
  };

  const impact = createSemanticImpact(
    ['product/components/interactive-controls/button/react/index.ts'],
    { discovery },
  );

  assert.deepEqual(impact.components, ['button']);
  assert.deepEqual(impact.packages, ['react']);
  assert.deepEqual(impact.browserPorts, ['react']);
  assert.deepEqual(impact.browserScopes, [{ port: 'react', components: ['button'] }]);
  assert.equal(impact.repositoryWide, false);
  assert.equal(impact.selectors.docsRequired, false);
  assert.equal(impact.selectors.packageArtifactsRequired, false);
});

test('Product Graph infrastructure changes fail closed to broad evidence', () => {
  const impact = createSemanticImpact(['tooling/product/discover-product-graph.mjs']);
  assert.equal(impact.repositoryWide, true);
  assert.ok(impact.semanticEvidence.includes('impact'));
  assert.equal(impact.selectors.packageArtifactsRequired, true);
  assert.equal(impact.selectors.browserRequired, true);
  assert.equal(impact.selectors.docsRequired, true);
  assert.equal(impact.selectors.releaseRequired, true);
});


test('settings evidence follows actual referenced example dependencies, not unrelated ports', () => {
  const graph = createSemanticImpact(['product/patterns/settings-navigation/docs/index.md']);
  assert.ok(graph.selectors.docsRequired);
  assert.ok(!graph.browserScopes.some((scope) => scope.components.includes('app-shell')));
  const drawer = createSemanticImpact(['product/components/composite-widgets/transient-surfaces/drawer/react/index.tsx']);
  assert.ok(drawer.browserScopes.some((scope) => scope.port === 'react' && scope.components.includes('app-shell')));
  assert.equal(drawer.selectors.docsRequired, false);
  const source = createSemanticImpact(['product/components/application-structures/app-shell/examples/settings-navigation/react.tsx']);
  assert.ok(source.browserScopes.some((scope) => scope.port === 'react' && scope.components.includes('app-shell')));
  assert.ok(source.selectors.docsRequired);
  const shared = createSemanticImpact(['product/capabilities/collection-navigation/core/index.ts']);
  assert.ok(shared.browserScopes.some((scope) => scope.port === 'react' && scope.components.includes('app-shell')));
  const unrelated = createSemanticImpact(['product/components/interactive-controls/button/vue/index.ts']);
  assert.ok(!unrelated.browserScopes.some((scope) => scope.port === 'react' && scope.components.includes('app-shell')));
});
