import { test } from 'vitest';
import assert from 'node:assert/strict';
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

  assert.equal(graph.components.some((component) => component.unitId === 'surface'), false);
  for (const pkg of graph.packages) {
    assert.equal(Boolean(pkg.manifest.exports?.['./surface']), false, pkg.name + ' must not export Surface');
    assert.equal(Boolean(pkg.manifest.exports?.['./styles/surface.css']), false, pkg.name + ' must not export Surface CSS');
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

test('retired inherited L1 candidates stay out of the Product Graph and public package surfaces', () => {
  const graph = discoverProductGraph();
  for (const id of ['surface', 'separator', 'visually-hidden', 'color-swatch']) {
    assert.equal(graph.components.some((entry) => entry.unitId === id), false, id + ' must not be a standalone component product unit');
  }
  for (const pkg of graph.packages) {
    assert.equal(Boolean(pkg.manifest.exports?.['./separator']), false, pkg.name + ' must not export generic Separator');
    assert.equal(Boolean(pkg.manifest.exports?.['./visually-hidden']), false, pkg.name + ' must not export VisuallyHidden wrappers');
    assert.equal(Boolean(pkg.manifest.exports?.['./styles/separator.css']), false, pkg.name + ' must not export generic Separator CSS');
    assert.equal(Boolean(pkg.manifest.exports?.['./styles/visually-hidden.css']), false, pkg.name + ' must not export redundant VisuallyHidden CSS');
    assert.equal(Boolean(pkg.manifest.exports?.['./styles/color-swatch.css']), false, pkg.name + ' must not export standalone ColorSwatch CSS');
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


test('L2 native selection and range controls project through unchanged ports', () => {
  const graph = discoverProductGraph();
  for (const id of ['native-select', 'slider']) {
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

test('L2 FileInput remains independently owned for native file selection', () => {
  const graph = discoverProductGraph();
  for (const id of ['file-input']) {
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

test('L3 aggregate layout projection owns only the six accepted composition primitives', () => {
  const graph = discoverProductGraph();
  const component = graph.components.find((entry) => entry.unitId === 'layout');
  assert.ok(component);
  assert.equal(component.layer, 'composition-primitives');
  assert.equal(component.facets.canonicalRoot, 'product/components/composition-primitives/layout/');
  assert.equal(component.facets.legacyRoot, null);
  assert.equal(component.migration.state, 'product-unit');
  assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'react', 'vue', 'web']);

  const elements = graph.packages.find((pkg) => pkg.id === 'elements');
  assert.ok(elements);
  assert.equal(Boolean(elements.manifest.exports?.['./layout']), false, 'Elements must use native HTML plus Web layout hooks instead of an L3 runtime entrypoint');

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

test('retired L2 specializations stay out of the Product Graph', () => {
  const graph = discoverProductGraph();
  for (const id of ['number-input', 'color-input', 'temporal-input', 'theme-toggle']) {
    assert.equal(graph.components.some((entry) => entry.unitId === id), false, id + ' must not remain a standalone component product unit');
  }
  assert.deepEqual(productGraphProblems(), []);
});
