import { test } from 'vitest';
import assert from 'node:assert/strict';
import { discoverProductGraph, productGraphProblems } from './discover-product-graph.mjs';

const expectedRoots = {
  button: 'interactive-controls/button',
  tabs: 'composite-widgets/disclosure-view-switching/tabs',
  dialog: 'composite-widgets/transient-surfaces/dialog',
  icon: 'elemental-primitives/media/icon',
  text: 'elemental-primitives/typography/text',
};

const compositeFamily = Object.freeze({
  disclosure: 'disclosure-view-switching',
  accordion: 'disclosure-view-switching',
  tabs: 'disclosure-view-switching',
  dialog: 'transient-surfaces',
  'alert-dialog': 'transient-surfaces',
  drawer: 'transient-surfaces',
  popover: 'transient-surfaces',
  tooltip: 'transient-surfaces',
  'preview-card': 'transient-surfaces',
  menu: 'commands-actions',
  'context-menu': 'commands-actions',
  menubar: 'commands-actions',
  toolbar: 'commands-actions',
  'split-button': 'commands-actions',
  listbox: 'collection-selection',
  select: 'collection-selection',
  combobox: 'collection-selection',
  'multi-select': 'collection-selection',
  'tag-group': 'collection-selection',
  'toggle-group': 'choice-value',
  'segmented-control': 'choice-value',
  rating: 'choice-value',
  'range-slider': 'choice-value',
  'search-field': 'compound-fields',
  'password-field': 'compound-fields',
  'number-field': 'compound-fields',
  'color-picker': 'compound-fields',
  'otp-field': 'compound-fields',
  'file-uploader': 'compound-fields',
  pagination: 'content-navigation',
  carousel: 'content-navigation',
  'split-panel': 'interactive-layout',
  toast: 'feedback',
});

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
    assert.ok(component.responsibility, `${id} must have an approved source responsibility`);
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

test('retired inherited elemental-primitive candidates stay out of the Product Graph and public package surfaces', () => {
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

test('Native-first interactive controls retain stable package projections after source migration', () => {
  const graph = discoverProductGraph();
  for (const id of ['link', 'checkbox', 'switch']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must remain discoverable');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.responsibility, 'interactive-controls');
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


test('Native selection and range controls project through unchanged ports', () => {
  const graph = discoverProductGraph();
  for (const id of ['native-select', 'slider']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' exists in the normalized Product Graph');
    assert.equal(component.responsibility, 'interactive-controls');
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

test('FileInput remains independently owned for native file selection', () => {
  const graph = discoverProductGraph();
  for (const id of ['file-input']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' remains discoverable');
    assert.equal(component.responsibility, 'interactive-controls');
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

test('Native text-entry components retain package identities and profiles', () => {
  const graph = discoverProductGraph();
  for (const id of ['input', 'textarea']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' remains discoverable');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.responsibility, 'interactive-controls');
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

test('Radio and ToggleButton remain native single-focus controls with stable projections', () => {
  const graph = discoverProductGraph();
  for (const id of ['radio', 'toggle-button']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must remain discoverable');
    assert.equal(component.responsibility, 'interactive-controls');
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

test('Disclosure and Accordion are canonical composite owners with unchanged public projections', () => {
  const graph = discoverProductGraph();
  for (const id of ['disclosure', 'accordion']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.responsibility, 'composite-widgets');
    assert.equal(component.family, compositeFamily[id]);
    assert.equal(component.facets.canonicalRoot, 'product/components/composite-widgets/' + compositeFamily[id] + '/' + id + '/');
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

test('Transient-surface composites retain stable five-port package projections after ownership migration', () => {
  const graph = discoverProductGraph();
  for (const id of ['alert-dialog', 'drawer', 'popover', 'tooltip', 'preview-card']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.responsibility, 'composite-widgets');
    assert.equal(component.facets.canonicalRoot, 'product/components/composite-widgets/' + compositeFamily[id] + '/' + id + '/');
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

test('Command composites retain canonical ownership and five-port projections', () => {
  const graph = discoverProductGraph();
  for (const id of ['menu', 'context-menu', 'menubar', 'toolbar', 'split-button']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.responsibility, 'composite-widgets');
    assert.equal(component.facets.canonicalRoot, 'product/components/composite-widgets/' + compositeFamily[id] + '/' + id + '/');
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

test('Selection and value composites retain canonical five-port projections', () => {
  const graph = discoverProductGraph();
  for (const id of ['listbox', 'select', 'combobox', 'multi-select', 'toggle-group', 'segmented-control', 'tag-group', 'rating', 'range-slider']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.responsibility, 'composite-widgets');
    assert.equal(component.facets.canonicalRoot, 'product/components/composite-widgets/' + compositeFamily[id] + '/' + id + '/');
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

test('Compound composites use canonical ownership and stable five-port projections', () => {
  const graph = discoverProductGraph();
  for (const id of ['carousel', 'color-picker', 'file-uploader', 'number-field', 'otp-field', 'pagination', 'password-field', 'search-field', 'split-panel', 'toast']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered');
    assert.equal(component.id, 'component:' + id);
    assert.equal(component.responsibility, 'composite-widgets');
    assert.equal(component.facets.canonicalRoot, 'product/components/composite-widgets/' + compositeFamily[id] + '/' + id + '/');
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

test('AppShell and SideNav retain canonical five-port projections', () => {
  const graph = discoverProductGraph();
  for (const id of ['app-shell', 'side-nav']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' must be discovered');
    assert.equal(component.responsibility, 'application-structures');
    assert.equal(component.facets.canonicalRoot, 'product/components/application-structures/' + id + '/');
    assert.equal(component.facets.legacyRoot, null);
    assert.equal(component.migration.state, 'product-unit');
    assert.deepEqual(Object.keys(component.surfaces).sort(), ['angular', 'elements', 'react', 'vue', 'web']);
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('Layout keeps Web as styling authority and projects only thin React authoring components', () => {
  const graph = discoverProductGraph();
  const component = graph.components.find((entry) => entry.unitId === 'layout');
  assert.ok(component);
  assert.equal(component.responsibility, 'composition-primitives');
  assert.equal(component.facets.canonicalRoot, 'product/components/composition-primitives/layout/');
  assert.equal(component.facets.legacyRoot, null);
  assert.equal(component.migration.state, 'product-unit');
  assert.deepEqual(Object.keys(component.surfaces).sort(), ['react', 'web']);
  assert.deepEqual(component.surfaces.web.publicEntrypoints, ['@vyrnforge/web/styles/layout.css']);
  assert.deepEqual(component.surfaces.react.publicEntrypoints, ['@vyrnforge/react/layout']);

  for (const pkg of graph.packages) {
    assert.equal(Boolean(pkg.manifest.exports?.['./layout']), pkg.id === 'react',
      pkg.name + ' must not clone React layout adapters in other ports');
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('Shared behavior uses canonical Core capability ownership without component-shaped runtime units', () => {
  const graph = discoverProductGraph();

  for (const id of ['collection-navigation', 'typeahead-matching']) {
    const capability = graph.units.find((entry) => entry.id === `capability:${id}`);
    assert.ok(capability, id + ' must be a canonical Core capability');
    assert.equal(capability.kind, 'capability');
    assert.equal(capability.authoringMode, 'product-unit');
    assert.equal(capability.migration.state, 'product-unit');
    assert.equal(capability.legacyNodes.length, 0);
    assert.deepEqual(Object.keys(capability.surfaces), ['core']);
    assert.deepEqual(capability.surfaces.core.authoringPaths, [`product/capabilities/${id}/core/`]);
    assert.equal(capability.surfaces.core.projectionPath, `packages/core/src/capabilities/${id}/`);
    assert.ok(capability.surfaces.core.publicEntrypoints.includes(`@vyrnforge/core/${id}`));
  }

  for (const retired of ['portal', 'presence']) {
    assert.equal(graph.components.some((entry) => entry.unitId === retired), false);
  }

  assert.deepEqual(productGraphProblems(), []);
});

test('Elemental-primitives aggregate stylesheet is not a component owner and responsibility families own their product units', () => {
  const graph = discoverProductGraph();
  assert.equal(graph.components.some((entry) => entry.unitId === 'elemental-primitives'), false);
  assert.equal(graph.components.some((entry) => entry.unitId === 'media'), false);
  assert.equal(graph.components.some((entry) => entry.unitId === 'mark'), false);

  for (const id of ['code', 'kbd']) {
    const component = graph.components.find((entry) => entry.unitId === id);
    assert.ok(component, id + ' is independently owned inside Typography');
    assert.equal(component.responsibility, 'elemental-primitives');
    assert.equal(component.facets.canonicalRoot, 'product/components/elemental-primitives/typography/' + id + '/');
    assert.deepEqual(Object.keys(component.surfaces), ['web', 'react']);
    assert.ok(component.surfaces.react.publicEntrypoints.includes('@vyrnforge/react/' + id));
  }

  const icon = graph.components.find((entry) => entry.unitId === 'icon');
  assert.ok(icon, 'icon is independently owned inside Media');
  assert.equal(icon.facets.canonicalRoot, 'product/components/elemental-primitives/media/icon/');
  assert.deepEqual(Object.keys(icon.surfaces).sort(), ['angular', 'elements', 'react', 'vue', 'web']);

  const image = graph.components.find((entry) => entry.unitId === 'image');
  assert.ok(image, 'image is independently owned inside Media');
  assert.equal(image.facets.canonicalRoot, 'product/components/elemental-primitives/media/image/');
  assert.deepEqual(Object.keys(image.surfaces).sort(), ['react', 'web']);

  assert.ok(graph.components.some((entry) => entry.unitId === 'skeleton'));
  assert.ok(graph.components.some((entry) => entry.unitId === 'progress'));
  assert.equal(graph.components.some((entry) => entry.unitId === 'loading'), false);

  const loading = graph.patterns.find((entry) => entry.unitId === 'loading');
  assert.ok(loading, 'loading owns async feedback as a Pattern outside component ownership');
  assert.equal(loading.id, 'pattern:loading');
  assert.equal(loading.responsibility, null);
  assert.equal(loading.facets.canonicalRoot, 'product/patterns/loading/');
  assert.deepEqual(Object.keys(loading.surfaces), ['web', 'react']);
  assert.ok(loading.surfaces.react.publicEntrypoints.includes('@vyrnforge/react/loading'));

  assert.deepEqual(productGraphProblems(), []);
});

test('retired native-control specializations stay out of the Product Graph', () => {
  const graph = discoverProductGraph();
  for (const id of ['number-input', 'color-input', 'temporal-input', 'theme-toggle']) {
    assert.equal(graph.components.some((entry) => entry.unitId === id), false, id + ' must not remain a standalone component product unit');
  }
  assert.deepEqual(productGraphProblems(), []);
});


test('retired TemporalField stays out of the Product Graph and public package surfaces', () => {
  const graph = discoverProductGraph();
  assert.equal(graph.components.some((entry) => entry.unitId === 'temporal-field'), false);
  for (const pkg of graph.packages) {
    assert.equal(Boolean(pkg.manifest.exports?.['./temporal-field']), false, pkg.name + ' must not export retired TemporalField');
    assert.equal(Boolean(pkg.manifest.exports?.['./styles/temporal-field.css']), false, pkg.name + ' must not export retired TemporalField CSS');
  }
  assert.deepEqual(productGraphProblems(), []);
});

test('Layout uses one shared Web recipe and one React authoring adapter, not six wrapper systems', () => {
  const graph = discoverProductGraph();
  const layout = graph.components.find((entry) => entry.unitId === 'layout');
  assert.ok(layout);
  assert.deepEqual(Object.keys(layout.surfaces).sort(), ['react', 'web']);
  assert.deepEqual(layout.surfaces.react.publicEntrypoints, ['@vyrnforge/react/layout']);
  assert.deepEqual(layout.surfaces.web.publicEntrypoints, ['@vyrnforge/web/styles/layout.css']);
  for (const name of ['angular', 'vue', 'elements', 'web']) {
    const manifest = graph.packages.find((pkg) => pkg.id === name)?.manifest;
    assert.equal(Boolean(manifest?.exports?.['./layout']), false, name + ' must not clone React layout wrappers');
  }
  assert.deepEqual(productGraphProblems(), []);
});
