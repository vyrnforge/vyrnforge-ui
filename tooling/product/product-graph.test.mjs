import { test } from 'vitest';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { discoverProductGraph, productGraphProblems } from './discover-product-graph.mjs';
import { impactProductView } from './product-graph-view.mjs';

function writer(root) {
  return (relativePath, content = '') => {
    const target = path.join(root, relativePath);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  };
}

test('current repository is normalized into one product graph', () => {
  const graph = discoverProductGraph();

  for (const id of ['button', 'tabs', 'dialog', 'icon']) {
    assert.ok(graph.components.some((component) => component.unitId === id), `${id} should exist`);
  }

  const reactPackage = graph.packages.find((pkg) => pkg.id === 'react');
  assert.ok(reactPackage);
  assert.equal(reactPackage.manifest.name, '@vyrnforge/react');
  assert.ok(reactPackage.manifest.exports['./button']);

  const button = graph.components.find((component) => component.unitId === 'button');
  assert.ok(button);
  assert.equal(button.id, 'component:button');
  assert.equal(button.layer, 'interactive-controls');
  assert.equal(button.category, null);
  assert.equal(button.facets.legacyRoot, null);
  assert.equal(button.facets.canonicalRoot, 'product/components/interactive-controls/button/');
  assert.equal(button.metadataSource, 'product-unit');
  assert.equal(button.documentationGroup, 'actions');
  assert.equal(button.surfaces.react.authoringMode, 'product-unit');
  assert.deepEqual(button.surfaces.react.authoringPaths, ['product/components/interactive-controls/button/react/']);
  assert.equal(button.surfaces.react.projectionPath, 'packages/react/src/components/button/');
  assert.equal(button.surfaces.angular.authoringMode, 'product-unit');
  assert.equal(button.surfaces.angular.projectionPath, 'packages/angular/button/src/');
  assert.equal(button.surfaces.web.authoringMode, 'product-unit');
  assert.equal(button.surfaces.web.projectionPath, 'packages/web/src/components/button/');
  assert.ok(button.surfaces.react.publicEntrypoints.includes('@vyrnforge/react/button'));
  assert.ok(button.surfaces.web.publicEntrypoints.includes('@vyrnforge/web/styles/button.css'));
  assert.equal(button.migration.state, 'product-unit');
  assert.deepEqual(productGraphProblems(), []);
});

test('nested component location drives package authoring but not public exports', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-product-graph-layered-'));
  const write = writer(root);
  write('packages/web/package.json', JSON.stringify({
    name: '@vyrnforge/web',
    exports: { './styles/button.css': './dist/components/button/button.css' },
  }));
  write('product/components/interactive-controls/button/component.json', '{"id":"button","name":"Button"}');
  write('product/components/interactive-controls/button/web/button.css', '[data-vf-button] {}\n');
  const graph = discoverProductGraph(root);
  const button = graph.components.find((component) => component.unitId === 'button');
  assert.equal(button.facets.canonicalRoot, 'product/components/interactive-controls/button/');
  assert.equal(button.layer, 'interactive-controls');
  assert.deepEqual(button.surfaces.web.authoringPaths, ['product/components/interactive-controls/button/web/']);
  assert.equal(button.surfaces.web.projectionPath, 'packages/web/src/components/button/');
  assert.deepEqual(button.surfaces.web.publicEntrypoints, ['@vyrnforge/web/styles/button.css']);
  assert.deepEqual(productGraphProblems(root), []);
});

test('canonical product-unit source overrides package-local authoring without changing package projection', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-product-graph-canonical-'));
  const write = writer(root);

  write('packages/react/package.json', JSON.stringify({
    name: '@vyrnforge/react',
    version: '1.0.0',
    exports: {
      '.': './dist/index.js',
      './button': './dist/components/button/index.js',
    },
  }));
  write('product/components/button/component.json', JSON.stringify({
    id: 'button',
    name: 'Button',
    group: 'actions',
  }));
  write('product/components/button/react/index.ts', 'export const Button = null;\n');
  write('product/components/button/docs/overview.md', '# Button\n');

  const graph = discoverProductGraph(root);
  const button = graph.components.find((component) => component.unitId === 'button');

  assert.ok(button);
  assert.equal(button.facets.canonicalRoot, 'product/components/button/');
  assert.equal(button.facets.legacyRoot, null);
  assert.equal(button.metadataSource, 'product-unit');
  assert.equal(button.documentationGroup, 'actions');
  assert.equal(button.surfaces.react.authoringMode, 'product-unit');
  assert.deepEqual(button.surfaces.react.authoringPaths, ['product/components/button/react/']);
  assert.equal(button.surfaces.react.projectionPath, 'packages/react/src/components/button/');
  assert.deepEqual(button.surfaces.react.legacyPaths, []);
  assert.deepEqual(button.surfaces.react.publicEntrypoints, ['@vyrnforge/react/button']);
  assert.equal(button.migration.state, 'product-unit');

  const impactView = impactProductView(graph);
  const impactButton = impactView.components.find((component) => component.component === 'button');
  assert.ok(impactButton);
  assert.equal(impactButton.root, 'product/components/button/');
  assert.deepEqual(impactButton.ports.react.paths, ['product/components/button/react/']);
  assert.deepEqual(productGraphProblems(root), []);
});

test('legacy and canonical ownership can coexist as one mixed component during migration', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-product-graph-mixed-'));
  const write = writer(root);

  write('packages/web/package.json', JSON.stringify({
    name: '@vyrnforge/web',
    exports: {
      '.': './dist/index.js',
      './styles/button.css': './dist/components/button/button.css',
    },
  }));
  write('packages/web/src/components/button/button.css', '[data-vf-button] {}\n');
  write('product/button/component.json', JSON.stringify({ documentation: { group: 'actions' } }));
  write('product/button/docs/index.html', '<h2>Button</h2>\n');
  write('product/components/button/web/button.css', '[data-vf-button] {}\n');

  const graph = discoverProductGraph(root);
  const button = graph.components.find((component) => component.unitId === 'button');

  assert.ok(button);
  assert.equal(button.migration.state, 'mixed');
  assert.equal(button.facets.canonicalRoot, 'product/components/button/');
  assert.equal(button.facets.legacyRoot, 'product/button/');
  assert.equal(button.surfaces.web.authoringMode, 'product-unit');
  assert.deepEqual(button.surfaces.web.authoringPaths, ['product/components/button/web/']);
  assert.equal(button.surfaces.web.projectionPath, 'packages/web/src/components/button/');
  assert.deepEqual(button.surfaces.web.legacyPaths, []);
  assert.deepEqual(button.surfaces.web.publicEntrypoints, ['@vyrnforge/web/styles/button.css']);
});

test('component Core source fails closed until its projection is deliberately defined', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-product-graph-core-projection-'));
  const write = writer(root);

  write('packages/core/package.json', JSON.stringify({
    name: '@vyrnforge/core',
    exports: { '.': './dist/index.js' },
  }));
  write('product/components/example/component.json', JSON.stringify({ name: 'Example' }));
  write('product/components/example/core/index.ts', 'export const value = 1;\n');

  const graph = discoverProductGraph(root);
  const example = graph.components.find((component) => component.unitId === 'example');
  assert.ok(example);
  assert.equal(example.surfaces.core.projectionPath, null);
  assert.ok(productGraphProblems(root).includes('component:example/core has no package projection destination'));
});

test('canonical capabilities merge legacy package ownership into one logical node', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-product-graph-capability-'));
  const write = writer(root);

  write('packages/core/package.json', JSON.stringify({
    name: '@vyrnforge/core',
    exports: { '.': './dist/index.js' },
  }));
  write('packages/core/src/capabilities/collection-navigation/index.ts', 'export const next = () => 0;\n');
  write('packages/core/test/capabilities/collection-navigation/navigation.test.mjs', 'export {};\n');
  write('product/capabilities/collection-navigation/core/index.ts', 'export const next = () => 0;\n');

  const graph = discoverProductGraph(root);
  const capability = graph.units.find((unit) => unit.id === 'capability:collection-navigation');

  assert.ok(capability);
  assert.equal(capability.authoringMode, 'product-unit');
  assert.deepEqual(capability.packages, ['core']);
  assert.equal(capability.legacyNodes.length, 1);
  assert.equal(capability.migration.state, 'mixed');

  const impactCapability = impactProductView(graph).ownedUnits.find((unit) => unit.id === 'collection-navigation');
  assert.ok(impactCapability);
  assert.ok(impactCapability.nodes.includes('capability:collection-navigation'));
  assert.ok(impactCapability.nodes.includes('unit:core:capabilities:collection-navigation'));
  assert.ok(impactCapability.paths.includes('product/capabilities/collection-navigation/'));
  assert.ok(impactCapability.paths.includes('packages/core/src/capabilities/collection-navigation/'));
});

test('L1 responsibility families preserve deliberate Native Web product ownership', () => {
  const graph = discoverProductGraph();
  assert.equal(graph.components.some((entry) => entry.unitId === 'elemental-primitives'), false);
  assert.equal(graph.components.some((entry) => entry.unitId === 'mark'), false);

  for (const id of ['code', 'kbd']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered as specialized Typography');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.layer, 'elemental-primitives');
    assert.equal(component.facets.canonicalRoot, 'product/components/elemental-primitives/typography/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces), ['web']);
    assert.deepEqual(component.surfaces.web.authoringPaths, ['product/components/elemental-primitives/typography/' + id + '/web/']);
    assert.equal(component.surfaces.web.projectionPath, 'packages/web/src/components/' + id + '/');
    assert.ok(component.surfaces.web.publicEntrypoints.includes('@vyrnforge/web/styles/' + id + '.css'));
  }

  const image = graph.components.find((entry) => entry.unitId === 'image');
  assert.ok(image, 'image must be discovered as native-backed Media');
  assert.equal(image.id, 'component:image');
  assert.equal(image.layer, 'elemental-primitives');
  assert.equal(image.facets.canonicalRoot, 'product/components/elemental-primitives/media/image/');
  assert.equal(image.facets.legacyRoot, null);
  assert.equal(image.metadataSource, 'product-unit');
  assert.equal(image.migration.state, 'product-unit');
  assert.deepEqual(Object.keys(image.surfaces), ['web']);
  assert.deepEqual(image.surfaces.web.authoringPaths, ['product/components/elemental-primitives/media/image/web/']);
  assert.equal(image.surfaces.web.projectionPath, 'packages/web/src/components/image/');
  assert.ok(image.surfaces.web.publicEntrypoints.includes('@vyrnforge/web/styles/image.css'));

  const icon = graph.components.find((entry) => entry.unitId === 'icon');
  assert.ok(icon, 'icon must be discovered as genuine Media primitive');
  assert.equal(icon.layer, 'elemental-primitives');
  assert.equal(icon.facets.canonicalRoot, 'product/components/elemental-primitives/media/icon/');

  assert.equal(graph.components.some((entry) => entry.unitId === 'color-swatch'), false);

  assert.equal(graph.components.some((entry) => entry.unitId === 'skeleton'), false);
  assert.equal(graph.components.some((entry) => entry.unitId === 'loading'), false);

  const loading = graph.patterns.find((entry) => entry.unitId === 'loading');
  assert.ok(loading, 'loading must own async feedback as a Pattern outside L1-L6');
  assert.equal(loading.id, 'pattern:loading');
  assert.equal(loading.kind, 'pattern');
  assert.equal(loading.layer, null);
  assert.equal(loading.facets.canonicalRoot, 'product/patterns/loading/');
  assert.equal(loading.facets.legacyRoot, null);
  assert.equal(loading.metadataPath, 'product/patterns/loading/pattern.json');
  assert.equal(loading.metadataSource, 'product-unit');
  assert.equal(loading.migration.state, 'product-unit');
  assert.deepEqual(Object.keys(loading.surfaces), ['web']);
  assert.ok(loading.surfaces.web.publicEntrypoints.includes('@vyrnforge/web/styles/loading.css'));

  assert.deepEqual(productGraphProblems(), []);
});
