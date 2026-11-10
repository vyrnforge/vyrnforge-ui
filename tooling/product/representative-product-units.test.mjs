import { test } from 'vitest';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { discoverProductGraph, productGraphProblems } from './discover-product-graph.mjs';

const expectedRoots = {
  button: 'interactive-controls/button',
  tabs: 'composite-components/tabs',
  dialog: 'composite-components/dialog',
  icon: 'elemental-primitives/media/icon',
  text: 'elemental-primitives/typography/text',
};

const expectedSurfaces = {
  button: ['angular', 'react', 'vue', 'web'],
  tabs: ['angular', 'elements', 'react', 'vue', 'web'],
  dialog: ['angular', 'elements', 'react', 'vue', 'web'],
  icon: ['angular', 'elements', 'react', 'vue', 'web'],
  text: ['angular', 'react', 'vue', 'web'],
};

test('canonical component migrations have one product owner', () => {
  const graph = discoverProductGraph();

  for (const [id, surfaces] of Object.entries(expectedSurfaces)) {
    const component = graph.components.find((candidate) => candidate.unitId === id);
    assert.ok(component, `${id} should exist in the Product Graph`);
    const canonicalRoot = `product/components/${expectedRoots[id]}/`;
    assert.equal(component.facets.canonicalRoot, canonicalRoot);
    assert.ok(component.layer, `${id} must have an approved source layer`);
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), surfaces);

    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.equal(surface.legacyPaths.length, 0);
      assert.ok(surface.authoringPaths[0].startsWith(canonicalRoot));
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

test('L1 native-backed primitives keep only justified framework projections', () => {
  const graph = discoverProductGraph();
  for (const [id, surfaces] of [
    ['surface', ['angular', 'react', 'vue', 'web']],
    ['separator', ['angular', 'react', 'vue', 'web']],
    ['visually-hidden', ['angular', 'react', 'vue', 'web']],
  ]) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must remain discoverable');
    assert.equal(component.layer, 'elemental-primitives');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.facets.canonicalRoot, 'product/components/elemental-primitives/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.deepEqual(Object.keys(component.surfaces).sort(), surfaces);
    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.ok(surface.authoringPaths[0].startsWith(component.facets.canonicalRoot));
      assert.ok(surface.projectionPath?.startsWith('packages/' + surface.package + '/'));
      assert.ok(surface.publicEntrypoints.length > 0);
    }
    // The package entrypoints remain stable while their sources are projected from this unit.
    assert.equal(component.migration.state, 'product-unit');
    for (const surface of Object.values(component.surfaces)) assert.deepEqual(surface.legacyPaths, []);
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('Native-first L2 controls retain stable package projections after source migration', () => {
  const graph = discoverProductGraph();
  for (const id of ['link', 'checkbox', 'switch']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must remain discoverable');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.layer, 'interactive-controls');
    assert.equal(component.facets.canonicalRoot, 'product/components/interactive-controls/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'react', 'vue', 'web']);
    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.deepEqual(surface.legacyPaths, []);
      assert.ok(surface.authoringPaths[0].startsWith(component.facets.canonicalRoot));
      assert.ok(surface.projectionPath?.startsWith('packages/' + surface.package + '/'));
      assert.ok(surface.publicEntrypoints.length > 0);
    }
  }
  assert.deepEqual(productGraphProblems(), []);
});


test('L2 number, native selection and range controls project through unchanged ports', () => {
  const graph = discoverProductGraph();
  for (const id of ['number-input', 'native-select', 'slider']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' exists in the normalized Product Graph');
    assert.equal(component.layer, 'interactive-controls');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.facets.canonicalRoot, 'product/components/interactive-controls/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'react', 'vue', 'web']);
    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.deepEqual(surface.legacyPaths, []);
      assert.ok(surface.authoringPaths[0].startsWith(component.facets.canonicalRoot));
      assert.ok(surface.projectionPath?.startsWith('packages/' + surface.package + '/'));
      assert.ok(surface.publicEntrypoints.length > 0);
    }
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('L2 specialized native inputs remain owned by the same package entrypoints', () => {
  const graph = discoverProductGraph();
  for (const id of ['file-input', 'color-input', 'temporal-input']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' remains discoverable');
    assert.equal(component.layer, 'interactive-controls');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.facets.canonicalRoot, 'product/components/interactive-controls/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'react', 'vue', 'web']);
    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.deepEqual(surface.legacyPaths, []);
      assert.ok(surface.authoringPaths[0].startsWith(component.facets.canonicalRoot));
      assert.ok(surface.projectionPath?.startsWith('packages/' + surface.package + '/'));
      assert.ok(surface.publicEntrypoints.length > 0);
    }
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('L2 native text-entry components retain package identities and profiles', () => {
  const graph = discoverProductGraph();
  for (const id of ['input', 'textarea']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' remains discoverable');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.layer, 'interactive-controls');
    assert.equal(component.facets.canonicalRoot, 'product/components/interactive-controls/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'react', 'vue', 'web']);
    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.deepEqual(surface.legacyPaths, []);
      assert.ok(surface.authoringPaths[0].startsWith(component.facets.canonicalRoot));
      assert.ok(surface.projectionPath?.startsWith('packages/' + surface.package + '/'));
      assert.ok(surface.publicEntrypoints.length > 0);
    }
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('L2 Radio and ToggleButton remain native single-focus controls with stable projections', () => {
  const graph = discoverProductGraph();
  for (const id of ['radio', 'toggle-button']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must remain discoverable');
    assert.equal(component.layer, 'interactive-controls');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.facets.canonicalRoot, 'product/components/interactive-controls/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'react', 'vue', 'web']);
    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.deepEqual(surface.legacyPaths, []);
      assert.ok(surface.authoringPaths[0].startsWith(component.facets.canonicalRoot));
      assert.ok(surface.projectionPath?.startsWith('packages/' + surface.package + '/'));
      assert.ok(surface.publicEntrypoints.length > 0);
    }
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('L5 Disclosure and Accordion are canonical composite owners with unchanged public projections', () => {
  const graph = discoverProductGraph();
  for (const id of ['disclosure', 'accordion']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.layer, 'composite-components');
    assert.equal(component.facets.canonicalRoot, 'product/components/composite-components/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'elements', 'react', 'vue', 'web']);
    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.deepEqual(surface.legacyPaths, []);
      assert.ok(surface.authoringPaths[0].startsWith(component.facets.canonicalRoot));
      assert.ok(surface.projectionPath?.startsWith('packages/' + surface.package + '/'));
      assert.ok(surface.publicEntrypoints.length > 0);
    }
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('L5 surface composites retain stable five-port package projections after ownership migration', () => {
  const graph = discoverProductGraph();
  for (const id of ['alert-dialog', 'drawer', 'popover', 'tooltip', 'preview-card']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.layer, 'composite-components');
    assert.equal(component.facets.canonicalRoot, 'product/components/composite-components/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'elements', 'react', 'vue', 'web']);
    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.deepEqual(surface.legacyPaths, []);
      assert.ok(surface.authoringPaths[0].startsWith(component.facets.canonicalRoot));
      assert.ok(surface.projectionPath?.startsWith('packages/' + surface.package + '/'));
      assert.ok(surface.publicEntrypoints.length > 0);
    }
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('L5 command composites retain canonical ownership and five-port projections', () => {
  const graph = discoverProductGraph();
  for (const id of ['menu', 'context-menu', 'menubar', 'toolbar', 'split-button']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.layer, 'composite-components');
    assert.equal(component.facets.canonicalRoot, 'product/components/composite-components/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'elements', 'react', 'vue', 'web']);
    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.deepEqual(surface.legacyPaths, []);
      assert.ok(surface.authoringPaths[0].startsWith(component.facets.canonicalRoot));
      assert.ok(surface.projectionPath?.startsWith('packages/' + surface.package + '/'));
      assert.ok(surface.publicEntrypoints.length > 0);
    }
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('L5 selection and value composites retain canonical five-port projections', () => {
  const graph = discoverProductGraph();
  for (const id of ['listbox', 'select', 'combobox', 'multi-select', 'toggle-group', 'segmented-control', 'tag-group', 'rating', 'range-slider']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.layer, 'composite-components');
    assert.equal(component.facets.canonicalRoot, 'product/components/composite-components/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'elements', 'react', 'vue', 'web']);
    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.deepEqual(surface.legacyPaths, []);
      assert.ok(surface.authoringPaths[0].startsWith(component.facets.canonicalRoot));
      assert.ok(surface.projectionPath?.startsWith('packages/' + surface.package + '/'));
      assert.ok(surface.publicEntrypoints.length > 0);
    }
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('final L5 compound composites use canonical ownership and stable five-port projections', () => {
  const graph = discoverProductGraph();
  for (const id of ['carousel', 'color-picker', 'file-uploader', 'number-field', 'otp-field', 'pagination', 'password-field', 'search-field', 'split-panel', 'temporal-field', 'toast']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.layer, 'composite-components');
    assert.equal(component.facets.canonicalRoot, 'product/components/composite-components/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.metadataSource, 'product-unit');
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'elements', 'react', 'vue', 'web']);
    for (const surface of Object.values(component.surfaces)) {
      assert.equal(surface.authoringMode, 'product-unit');
      assert.deepEqual(surface.legacyPaths, []);
      assert.ok(surface.authoringPaths[0].startsWith(component.facets.canonicalRoot));
      assert.ok(surface.projectionPath?.startsWith('packages/' + surface.package + '/'));
      assert.ok(surface.publicEntrypoints.length > 0);
    }
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('L6 AppShell and SideNav retain canonical five-port projections', () => {
  const graph = discoverProductGraph();
  for (const id of ['app-shell', 'side-nav']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered');
    assert.equal(component.layer, 'complex-components');
    assert.equal(component.facets.canonicalRoot, 'product/components/complex-components/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'elements', 'react', 'vue', 'web']);
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('L3 grouped layout projection has canonical composition ownership', () => {
  const graph = discoverProductGraph();
  const component = graph.components.find((entry) => entry.unitId === 'layout');
  assert.ok(component);
  assert.equal(component.layer, 'composition-primitives');
  assert.equal(component.facets.canonicalRoot, 'product/components/composition-primitives/layout/');
  assert.equal(component.facets.legacyRoot, null);
  assert.equal(component.migration.state, 'product-unit');
  assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'elements', 'react', 'vue', 'web']);
  assert.deepEqual(productGraphProblems(), []);
});

test('L4 Portal and Presence use canonical port-infrastructure ownership', () => {
  const graph = discoverProductGraph();
  for (const id of ['portal', 'presence']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component);
    assert.equal(component.layer, 'behavioral-infrastructure');
    assert.equal(component.facets.canonicalRoot, 'product/components/behavioral-infrastructure/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'elements', 'react', 'vue']);
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('L1 aggregate stylesheet is not a component owner and responsibility families own their product units', () => {
  const graph = discoverProductGraph();
  assert.equal(graph.components.some((entry) => entry.unitId === 'elemental-primitives'), false);
  assert.equal(graph.components.some((entry) => entry.unitId === 'media'), false);
  assert.equal(graph.components.some((entry) => entry.unitId === 'mark'), false);

  for (const id of ['code', 'kbd']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' is independently owned inside Typography');
    assert.equal(component.layer, 'elemental-primitives');
    assert.equal(component.facets.canonicalRoot, 'product/components/elemental-primitives/typography/' + id + '/');
    assert.deepEqual(Object.keys(component.surfaces), ['web']);
  }

  const icon = graph.components.find((entry) => entry.unitId === 'icon');
  assert.ok(icon, 'icon is independently owned inside Media');
  assert.equal(icon.facets.canonicalRoot, 'product/components/elemental-primitives/media/icon/');
  assert.deepEqual(Object.keys(icon.surfaces).sort(), ['angular', 'elements', 'react', 'vue', 'web']);

  const image = graph.components.find((entry) => entry.unitId === 'image');
  assert.ok(image, 'image is independently owned inside Media');
  assert.equal(image.facets.canonicalRoot, 'product/components/elemental-primitives/media/image/');
  assert.deepEqual(Object.keys(image.surfaces), ['web']);

  const colorSwatch = graph.components.find((entry) => entry.unitId === 'color-swatch');
  assert.ok(colorSwatch, 'color-swatch remains independently owned outside Media');
  assert.equal(colorSwatch.layer, 'elemental-primitives');
  assert.deepEqual(Object.keys(colorSwatch.surfaces), ['web']);

  assert.equal(graph.components.some((entry) => entry.unitId === 'skeleton'), false);
  assert.equal(graph.components.some((entry) => entry.unitId === 'loading'), false);

  const loading = graph.patterns.find((entry) => entry.unitId === 'loading');
  assert.ok(loading, 'loading owns async feedback as a Pattern outside L1-L6');
  assert.equal(loading.id, 'pattern:loading');
  assert.equal(loading.layer, null);
  assert.equal(loading.facets.canonicalRoot, 'product/patterns/loading/');
  assert.deepEqual(Object.keys(loading.surfaces), ['web']);

  assert.deepEqual(productGraphProblems(), []);
});

test('L1 approved inventory is exact, documented, and accessibility-classified', () => {
  const graph = discoverProductGraph();
  const expected = new Map([
    ['text', ['angular', 'react', 'vue', 'web']],
    ['code', ['web']],
    ['kbd', ['web']],
    ['icon', ['angular', 'elements', 'react', 'vue', 'web']],
    ['image', ['web']],
    ['surface', ['angular', 'react', 'vue', 'web']],
    ['separator', ['angular', 'react', 'vue', 'web']],
    ['color-swatch', ['web']],
    ['visually-hidden', ['angular', 'react', 'vue', 'web']],
  ]);

  const elemental = graph.components
    .filter((component) => component.layer === 'elemental-primitives')
    .sort((left, right) => left.unitId.localeCompare(right.unitId));

  assert.deepEqual(
    elemental.map((component) => component.unitId),
    [...expected.keys()].sort(),
  );

  for (const component of elemental) {
    assert.deepEqual(Object.keys(component.surfaces).sort(), expected.get(component.unitId));
    assert.ok(component.facets.docs, component.unitId + ' must own repository documentation');
    assert.ok(
      existsSync(component.facets.root + 'accessibility.json'),
      component.unitId + ' must own an accessibility classification',
    );
    assert.ok(component.facets.examples, component.unitId + ' must own executable examples');
    assert.ok(component.facets.test, component.unitId + ' must own executable evidence');
  }

  assert.equal(graph.components.some((component) => component.unitId === 'skeleton'), false);
  assert.equal(graph.components.some((component) => component.unitId === 'loading'), false);
  assert.deepEqual(productGraphProblems(), []);
});

test('L2 Theme Toggle uses canonical Native Web ownership without inventing framework wrappers', () => {
  const graph = discoverProductGraph();
  const component = graph.components.find((entry) => entry.unitId === 'theme-toggle');
  assert.ok(component, 'theme-toggle must be discovered');
  assert.equal(component.id, 'component:theme-toggle');
  assert.equal(component.layer, 'interactive-controls');
  assert.equal(component.facets.canonicalRoot, 'product/components/interactive-controls/theme-toggle/');
  assert.equal(component.facets.legacyRoot, null);
  assert.equal(component.metadataSource, 'product-unit');
  assert.equal(component.migration.state, 'product-unit');
  assert.deepEqual(Object.keys(component.surfaces).sort(), ['web']);
  const web = component.surfaces.web;
  assert.equal(web.authoringMode, 'product-unit');
  assert.deepEqual(web.legacyPaths, []);
  assert.ok(web.authoringPaths[0].startsWith(component.facets.canonicalRoot));
  assert.equal(web.projectionPath, 'packages/web/src/components/theme-toggle/');
  assert.ok(web.publicEntrypoints.includes('@vyrnforge/web/styles/theme-toggle.css'));
  assert.deepEqual(productGraphProblems(), []);
});
