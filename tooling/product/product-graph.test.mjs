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
  assert.equal(graph.schemaVersion, 3);

  for (const id of ['button', 'tabs', 'dialog', 'icon']) {
    assert.ok(graph.components.some((component) => component.unitId === id), `${id} should exist`);
  }

  for (const id of ['collection-navigation', 'typeahead-matching']) {
    const capability = graph.units.find((unit) => unit.id === `capability:${id}`);
    assert.ok(capability, `${id} should be a canonical capability`);
    assert.equal(capability.authoringMode, 'product-unit');
    assert.equal(capability.migration.state, 'product-unit');
    assert.deepEqual(capability.packages, ['core']);
    assert.equal(capability.legacyNodes.length, 0);
    assert.deepEqual(Object.keys(capability.surfaces), ['core']);
    assert.ok(capability.surfaces.core.publicEntrypoints.includes(`@vyrnforge/core/${id}`));
  }

  const reactPackage = graph.packages.find((pkg) => pkg.id === 'react');
  assert.ok(reactPackage);
  assert.equal(reactPackage.manifest.name, '@vyrnforge/react');
  assert.ok(reactPackage.manifest.exports['./button']);

  const button = graph.components.find((component) => component.unitId === 'button');
  assert.ok(button);
  assert.equal(button.id, 'component:button');
  assert.equal(button.responsibility, 'interactive-controls');
  assert.equal(button.family, null);
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
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-product-graph-responsibility-'));
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
  assert.equal(button.responsibility, 'interactive-controls');
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
  write('product/components/interactive-controls/button/component.json', JSON.stringify({
    id: 'button',
    name: 'Button',
    group: 'actions',
  }));
  write('product/components/interactive-controls/button/react/index.ts', 'export const Button = null;\n');
  write('product/components/interactive-controls/button/docs/overview.md', '# Button\n');

  const graph = discoverProductGraph(root);
  const button = graph.components.find((component) => component.unitId === 'button');

  assert.ok(button);
  assert.equal(button.facets.canonicalRoot, 'product/components/interactive-controls/button/');
  assert.equal(button.facets.legacyRoot, null);
  assert.equal(button.metadataSource, 'product-unit');
  assert.equal(button.documentationGroup, 'actions');
  assert.equal(button.surfaces.react.authoringMode, 'product-unit');
  assert.deepEqual(button.surfaces.react.authoringPaths, ['product/components/interactive-controls/button/react/']);
  assert.equal(button.surfaces.react.projectionPath, 'packages/react/src/components/button/');
  assert.deepEqual(button.surfaces.react.legacyPaths, []);
  assert.deepEqual(button.surfaces.react.publicEntrypoints, ['@vyrnforge/react/button']);
  assert.equal(button.migration.state, 'product-unit');

  const impactView = impactProductView(graph);
  const impactButton = impactView.components.find((component) => component.component === 'button');
  assert.ok(impactButton);
  assert.equal(impactButton.root, 'product/components/interactive-controls/button/');
  assert.deepEqual(impactButton.ports.react.paths, ['product/components/interactive-controls/button/react/']);
  assert.deepEqual(productGraphProblems(root), []);
});

test('retired top-level component slices cannot supply canonical ownership or facets', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-product-graph-retired-'));
  const write = writer(root);
  write('product/button/component.json', '{}');
  write('product/components/interactive-controls/button/component.json', '{}');
  assert.throws(() => discoverProductGraph(root), /Retired flat product ownership/);
});

test('manifest-only component exports fail closed without synthesizing owners', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-product-graph-orphan-'));
  const write = writer(root);
  write('packages/react/package.json', JSON.stringify({
    name: '@vyrnforge/react', exports: { './button': './dist/components/button/index.js' },
  }));
  assert.throws(() => discoverProductGraph(root), /Public component react\/button is missing canonical ownership/);
});

test('public component authoring cannot fall back to package-local source', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-product-graph-missing-source-'));
  const write = writer(root);
  write('packages/react/package.json', JSON.stringify({
    name: '@vyrnforge/react', exports: { './button': './dist/components/button/index.js' },
  }));
  write('product/components/interactive-controls/button/component.json', '{}');
  write('packages/react/src/components/button/index.ts', 'export {};');
  assert.ok(productGraphProblems(root).includes('component:button/react has no authoring source'));
});

test('component Core source fails closed until its projection is deliberately defined', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-product-graph-core-projection-'));
  const write = writer(root);

  write('packages/core/package.json', JSON.stringify({
    name: '@vyrnforge/core',
    exports: {
      '.': './dist/index.js',
      './collection-navigation': './dist/capabilities/collection-navigation/index.js',
    },
  }));
  write('product/components/elemental-primitives/example/component.json', JSON.stringify({ name: 'Example' }));
  write('product/components/elemental-primitives/example/core/index.ts', 'export const value = 1;\n');

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
    exports: {
      '.': './dist/index.js',
      './collection-navigation': './dist/capabilities/collection-navigation/index.js',
    },
  }));
  write('packages/core/src/capabilities/collection-navigation/index.ts', 'export const next = () => 0;\n');
  write('packages/core/test/capabilities/collection-navigation/navigation.test.mjs', 'export {};\n');
  write('product/capabilities/collection-navigation/core/index.ts', 'export const next = () => 0;\n');
  write('product/capabilities/collection-navigation/test/navigation.test.mjs', 'export {};\n');

  const graph = discoverProductGraph(root);
  const capability = graph.units.find((unit) => unit.id === 'capability:collection-navigation');

  assert.ok(capability);
  assert.equal(capability.authoringMode, 'product-unit');
  assert.deepEqual(capability.packages, ['core']);
  assert.deepEqual(Object.keys(capability.surfaces), ['core']);
  assert.deepEqual(capability.surfaces.core.authoringPaths, ['product/capabilities/collection-navigation/core/']);
  assert.equal(capability.surfaces.core.projectionPath, 'packages/core/src/capabilities/collection-navigation/');
  assert.deepEqual(capability.surfaces.core.publicEntrypoints, ['@vyrnforge/core/collection-navigation']);
  assert.equal(capability.testPath, 'product/capabilities/collection-navigation/test/');
  assert.equal(capability.legacyNodes.length, 1);
  assert.equal(capability.migration.state, 'mixed');

  const impactCapability = impactProductView(graph).ownedUnits.find((unit) => unit.id === 'collection-navigation');
  assert.ok(impactCapability);
  assert.ok(impactCapability.nodes.includes('capability:collection-navigation'));
  assert.ok(impactCapability.nodes.includes('unit:core:capabilities:collection-navigation'));
  assert.ok(impactCapability.paths.includes('product/capabilities/collection-navigation/'));
  assert.ok(impactCapability.paths.includes('product/capabilities/collection-navigation/test/'));
  assert.ok(impactCapability.paths.includes('packages/core/src/capabilities/collection-navigation/'));
});

test('Elemental-primitives responsibility families preserve deliberate Native Web product ownership', () => {
  const graph = discoverProductGraph();
  assert.equal(graph.components.some((entry) => entry.unitId === 'elemental-primitives'), false);
  assert.equal(graph.components.some((entry) => entry.unitId === 'mark'), false);

  for (const id of ['code', 'kbd']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered as specialized Typography');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.responsibility, 'elemental-primitives');
    assert.equal(component.facets.canonicalRoot, 'product/components/elemental-primitives/typography/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces), ['web', 'react']);
    assert.deepEqual(component.surfaces.react.authoringPaths, ['product/components/elemental-primitives/typography/' + id + '/react/']);
    assert.equal(component.surfaces.react.projectionPath, 'packages/react/src/components/' + id + '/');
    assert.ok(component.surfaces.react.publicEntrypoints.includes('@vyrnforge/react/' + id));
    assert.deepEqual(component.surfaces.web.authoringPaths, ['product/components/elemental-primitives/typography/' + id + '/web/']);
    assert.equal(component.surfaces.web.projectionPath, 'packages/web/src/components/' + id + '/');
    assert.ok(component.surfaces.web.publicEntrypoints.includes('@vyrnforge/web/styles/' + id + '.css'));
  }

  const image = graph.components.find((entry) => entry.unitId === 'image');
  assert.ok(image, 'image must be discovered as native-backed Media');
  assert.equal(image.id, 'component:image');
  assert.equal(image.responsibility, 'elemental-primitives');
  assert.equal(image.facets.canonicalRoot, 'product/components/elemental-primitives/media/image/');
  assert.equal(image.facets.legacyRoot, null);
  assert.equal(image.metadataSource, 'product-unit');
  assert.equal(image.migration.state, 'product-unit');
  assert.deepEqual(Object.keys(image.surfaces).sort(), ['react', 'web']);
  assert.deepEqual(image.surfaces.web.authoringPaths, ['product/components/elemental-primitives/media/image/web/']);
  assert.equal(image.surfaces.web.projectionPath, 'packages/web/src/components/image/');
  assert.ok(image.surfaces.web.publicEntrypoints.includes('@vyrnforge/web/styles/image.css'));

  const icon = graph.components.find((entry) => entry.unitId === 'icon');
  assert.ok(icon, 'icon must be discovered as genuine Media primitive');
  assert.equal(icon.responsibility, 'elemental-primitives');
  assert.equal(icon.facets.canonicalRoot, 'product/components/elemental-primitives/media/icon/');

  assert.equal(graph.components.some((entry) => entry.unitId === 'color-swatch'), false);

  assert.ok(graph.components.some((entry) => entry.unitId === 'skeleton'));
  assert.ok(graph.components.some((entry) => entry.unitId === 'progress'));
  assert.equal(graph.components.some((entry) => entry.unitId === 'loading'), false);

  const loading = graph.patterns.find((entry) => entry.unitId === 'loading');
  assert.ok(loading, 'loading must own async feedback as a Pattern outside component ownership');
  assert.equal(loading.id, 'pattern:loading');
  assert.equal(loading.kind, 'pattern');
  assert.equal(loading.responsibility, null);
  assert.equal(loading.facets.canonicalRoot, 'product/patterns/loading/');
  assert.equal(loading.facets.legacyRoot, null);
  assert.equal(loading.metadataPath, 'product/patterns/loading/pattern.json');
  assert.equal(loading.metadataSource, 'product-unit');
  assert.equal(loading.migration.state, 'product-unit');
  assert.deepEqual(Object.keys(loading.surfaces), ['web', 'react']);
  assert.ok(loading.surfaces.react.publicEntrypoints.includes('@vyrnforge/react/loading'));
  assert.ok(loading.surfaces.web.publicEntrypoints.includes('@vyrnforge/web/styles/loading.css'));

  assert.deepEqual(productGraphProblems(), []);
});


test('settings pattern is documentation-only and references existing React evidence', () => {
  const graph = discoverProductGraph();
  const pattern = graph.patterns.find((entry) => entry.id === 'pattern:settings-navigation');
  assert.ok(pattern.documentationAvailable);
  assert.deepEqual(pattern.surfaces, {});
  assert.deepEqual(pattern.publicEntrypoints, []);
  assert.deepEqual(pattern.packages, []);
  const reference = pattern.exampleReferences[0];
  assert.equal(reference.id, 'app-shell/settings-navigation');
  assert.equal(reference.owner, 'component:app-shell');
  assert.deepEqual(reference.frameworks.map((entry) => entry.framework), ['react']);
  assert.equal(reference.evidence.port, 'react');
  assert.equal(reference.evidence.fixtureUrl, '/components/app-shell/settings-navigation-react.html');
  assert.equal(reference.evidence.testName, 'settings navigation preserves deep links, route history, title and focus while local state remains local');
  assert.deepEqual([...new Set(reference.frameworks[0].usage.map((entry) => entry.component))].sort(), ['app-shell', 'button', 'drawer', 'input', 'side-nav', 'tabs']);
  assert.ok(graph.patterns.find((entry) => entry.id === 'pattern:loading').publicEntrypoints.includes('@vyrnforge/web/styles/loading.css'));
  const closure = reference.frameworks[0].usageClosure;
  assert.ok(closure.some((edge) => edge.component === 'dialog' && edge.port === 'react'));
  assert.ok(closure.some((edge) => edge.component === 'dialog' && edge.port === 'web'));
  assert.ok(!closure.some((edge) => edge.port === 'vue'));
});

test('pattern metadata identity mismatch fails closed', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-pattern-id-'));
  writer(root)('product/patterns/other/pattern.json', '{"id":"loading"}');
  assert.throws(() => discoverProductGraph(root), /Pattern metadata identity mismatch/);
});


function referenceFixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-pattern-reference-'));
  const write = writer(root);
  const component = 'product/components/interactive-controls/button/';
  const example = component + 'examples/task/';
  const pattern = 'product/patterns/button/';
  write('packages/react/package.json', JSON.stringify({ name: '@vyrnforge/react', exports: { './button': './dist/components/button/index.js' } }));
  write('packages/web/package.json', JSON.stringify({ name: '@vyrnforge/web', exports: { './styles/button.css': './dist/components/button/button.css' } }));
  write(component + 'component.json', '{"id":"button","name":"Button"}');
  write(component + 'react/index.ts', 'export const Button = null;');
  write(component + 'web/button.css', '[data-vf-button] {}');
  write(example + 'example.json', '{"id":"button/task","title":"Task","frameworks":{"react":{"source":"react.tsx"}}}');
  write(example + 'react.tsx', "import { Button } from '@vyrnforge/react/button';");
  write(component + 'test/browser/fixtures.mjs', "const examples = ['task'];");
  write(component + 'test/browser/tests/task.spec.mjs', "test('existing task', () => { const url = '/components/button/task-react.html'; });");
  const ref = { id: 'button/task', owner: 'component:button', evidence: {
    port: 'react', fixture: component + 'test/browser/fixtures.mjs', spec: component + 'test/browser/tests/task.spec.mjs',
    fixtureUrl: '/components/button/task-react.html', testName: 'existing task',
  } };
  const metadata = (refs = [ref]) => write(pattern + 'pattern.json', JSON.stringify({ id: 'button', exampleReferences: refs }));
  metadata();
  write(pattern + 'docs/index.md', '# Button task\n');
  return { root, write, metadata, ref, example };
}

test('documentation-only pattern cannot inherit same-named component exports', () => {
  const { root } = referenceFixture();
  const graph = discoverProductGraph(root);
  assert.deepEqual(graph.patterns[0].publicEntrypoints, []);
  assert.deepEqual(graph.patterns[0].surfaces, {});
  assert.equal(graph.patterns[0].documentationAvailable, true);
  assert.deepEqual(graph.components[0].surfaces.web.publicEntrypoints, ['@vyrnforge/web/styles/button.css']);
});

test('pattern references reject missing, duplicate, cyclic or unsupported source and evidence declarations', () => {
  {
    const { root, metadata, ref } = referenceFixture();
    metadata([ref, ref]);
    assert.throws(() => discoverProductGraph(root), /duplicate pattern example/);
  }
  {
    const { root, metadata, ref } = referenceFixture();
    metadata([{ ...ref, id: 'button/missing' }]);
    assert.throws(() => discoverProductGraph(root), /Missing pattern example manifest/);
  }
  {
    const { root, metadata, ref } = referenceFixture();
    metadata([{ ...ref, owner: 'pattern:button' }]);
    assert.throws(() => discoverProductGraph(root), /Invalid pattern example owner/);
  }
  {
    const { root, write, example } = referenceFixture();
    write(example + 'example.json', '{"id":"button/task","frameworks":{"other":{"source":"react.tsx"}}}');
    assert.throws(() => discoverProductGraph(root), /Unsupported example framework/);
  }
  {
    const { root, write, example } = referenceFixture();
    write(example + 'example.json', '{"id":"button/task","frameworks":{"react":{"source":"missing.tsx"}}}');
    assert.throws(() => discoverProductGraph(root), /Missing or invalid example source/);
  }
  {
    const { root, write, example } = referenceFixture();
    write(example + 'react.tsx', "import { Missing } from '@vyrnforge/react/missing';");
    assert.throws(() => discoverProductGraph(root), /Unresolved pattern example dependency/);
  }
  {
    const { root, metadata, ref } = referenceFixture();
    metadata([{ ...ref, evidence: { ...ref.evidence, testName: 'nonexistent test' } }]);
    assert.throws(() => discoverProductGraph(root), /Unresolved pattern fixture or test identity/);
  }
});


test('pattern usage follows projected sibling imports recursively and rejects a missing target', () => {
  const { root, write } = referenceFixture();
  const button = 'product/components/interactive-controls/button/';
  const drawer = 'product/components/composite-widgets/transient-surfaces/drawer/';
  const dialog = 'product/components/composite-widgets/transient-surfaces/dialog/';
  write('packages/react/package.json', JSON.stringify({ name: '@vyrnforge/react', exports: {
    './button': './dist/components/button/index.js',
    './drawer': './dist/components/drawer/index.js',
    './dialog': './dist/components/dialog/index.js',
  } }));
  write(drawer + 'component.json', '{"id":"drawer","name":"Drawer"}');
  write(dialog + 'component.json', '{"id":"dialog","name":"Dialog"}');
  write(button + 'react/index.ts', "export { Drawer as Button } from '../drawer/index.js';");
  write(drawer + 'react/index.ts', "export { Dialog as Drawer } from '../dialog/index.js';");
  write(dialog + 'react/index.ts', 'export const Dialog = null;');
  const graph = discoverProductGraph(root);
  assert.deepEqual(graph.patterns[0].exampleReferences[0].frameworks[0].usageClosure, [
    { component: 'button', port: 'react' },
    { component: 'dialog', port: 'react' },
    { component: 'drawer', port: 'react' },
  ]);
  write(drawer + 'react/index.ts', "export { Dialog as Drawer } from '../dialog/missing.js';");
  assert.throws(() => discoverProductGraph(root), /Unresolved pattern usage source/);
});
