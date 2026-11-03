import { strict as assert } from 'node:assert';
import { test } from 'vitest';
import { createSemanticImpact } from './plan.mjs';

test('canonical product-unit framework source remains port-local without unrelated Native docs evidence', () => {
  const discovery = {
    packages: [{ name: 'react', manifest: {} }],
    components: [{
      component: 'button',
      status: 'implemented',
      root: 'product/components/button/',
      roots: ['product/components/button/'],
      ports: {
        react: {
          paths: ['product/components/button/react/'],
          browser: true,
          dependencies: [],
          types: null,
          ssr: null,
        },
      },
      metadataPath: 'product/components/button/component.json',
      documentationGroup: 'actions',
    }],
    ownedUnits: [],
  };

  const impact = createSemanticImpact(
    ['product/components/button/react/index.ts'],
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
