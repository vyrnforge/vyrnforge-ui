import { test } from 'vitest';
import assert from 'node:assert/strict';
import { discoverProductGraph, productGraphProblems } from './discover-product-graph.mjs';

const expectedRoots = {
  button: 'interactive-controls/button',
  tabs: 'composite-components/tabs',
  dialog: 'composite-components/dialog',
  icon: 'elemental-primitives/icon',
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

test('L1 legacy primitives acquire layered authoring while package shells remain transitional', () => {
  const graph = discoverProductGraph();
  for (const [id, surfaces] of [
    ['surface', ['angular', 'elements', 'react', 'vue', 'web']],
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
