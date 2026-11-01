import { test } from 'vitest';
import assert from 'node:assert/strict';
import { discoverProductGraph, productGraphProblems } from './discover-product-graph.mjs';

const expectedSurfaces = {
  button: ['angular', 'react', 'vue', 'web'],
  tabs: ['angular', 'elements', 'react', 'vue', 'web'],
  dialog: ['angular', 'elements', 'react', 'vue', 'web'],
  icon: ['angular', 'elements', 'react', 'vue', 'web'],
};

test('representative component migrations have one canonical product owner', () => {
  const graph = discoverProductGraph();

  for (const [id, surfaces] of Object.entries(expectedSurfaces)) {
    const component = graph.components.find((candidate) => candidate.unitId === id);
    assert.ok(component, `${id} should exist in the Product Graph`);
    assert.equal(component.facets.canonicalRoot, `product/components/${id}/`);
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), surfaces);

    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.equal(surface.legacyPaths.length, 0);
      assert.ok(surface.authoringPaths[0].startsWith(`product/components/${id}/`));
      assert.ok(surface.projectionPath?.startsWith(`packages/${surface.package}/`));
    }
  }

  assert.deepEqual(productGraphProblems(), []);
});

test('Icon component projections remain separate from the icon catalog package', () => {
  const graph = discoverProductGraph();
  const icon = graph.components.find((component) => component.unitId === 'icon');
  assert.ok(icon);
  assert.equal(icon.packages.includes('icons'), false);
  assert.ok(graph.packages.some((pkg) => pkg.id === 'icons'));
});
