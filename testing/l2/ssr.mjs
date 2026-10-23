import test from 'node:test';
import assert from 'node:assert/strict';

const definitions = {
  link: { exportName: 'Link', tag: 'a', hook: 'data-vf-link', reactProps: { href: '#target' }, content: 'Example link', angular: '<a id="control" vfLink href="#target">Example link</a>' },
  'toggle-button': { exportName: 'ToggleButton', angularName: 'VfToggleButtonDirective', tag: 'button', hook: 'data-vf-toggle-button', content: 'Toggle', angular: '<button id="control" vfToggleButton>Toggle</button>' },
  'number-input': { exportName: 'NumberInput', angularName: 'VfNumberInputDirective', tag: 'input', hook: 'data-vf-number-input', type: 'number', reactProps: { defaultValue: 42 }, angular: '<input id="control" vfNumberInput value="42">' },
  checkbox: { exportName: 'Checkbox', angularName: 'VfCheckboxDirective', tag: 'input', hook: 'data-vf-checkbox', type: 'checkbox', reactProps: { indeterminate: true }, angular: '<input id="control" vfCheckbox [indeterminate]="true">' },
  radio: { exportName: 'Radio', angularName: 'VfRadioDirective', tag: 'input', hook: 'data-vf-radio', type: 'radio', reactProps: { name: 'choice', value: 'one', defaultChecked: true }, angular: '<input id="control" vfRadio name="choice" value="one" checked>' },
  switch: { exportName: 'Switch', angularName: 'VfSwitchDirective', tag: 'input', hook: 'data-vf-switch', type: 'checkbox', role: 'switch', reactProps: { name: 'enabled' }, angular: '<input id="control" vfSwitch name="enabled">' },
  'native-select': { exportName: 'NativeSelect', angularName: 'VfNativeSelectDirective', tag: 'select', hook: 'data-vf-native-select', select: true, angular: '<select id="control" vfNativeSelect name="control"><option value="one">One</option><option value="two" selected>Two</option></select>' },
  slider: { exportName: 'Slider', angularName: 'VfSliderDirective', tag: 'input', hook: 'data-vf-slider', type: 'range', reactProps: { min: 0, max: 100, defaultValue: 50 }, angular: '<input id="control" vfSlider min="0" max="100" value="50">' },
  'file-input': { exportName: 'FileInput', angularName: 'VfFileInputDirective', tag: 'input', hook: 'data-vf-file-input', type: 'file', angular: '<input id="control" vfFileInput name="upload">' },
  'color-input': { exportName: 'ColorInput', angularName: 'VfColorInputDirective', tag: 'input', hook: 'data-vf-color-input', type: 'color', reactProps: { defaultValue: '#2563eb' }, angular: '<input id="control" vfColorInput value="#2563eb">' },
  'temporal-input': { exportName: 'TemporalInput', angularName: 'VfTemporalInputDirective', tag: 'input', hook: 'data-vf-temporal-input', type: 'date', reactProps: { type: 'date', defaultValue: '2026-01-21' }, angular: '<input id="control" vfTemporalInput type="date" value="2026-01-21">' },
};
for (const [id, definition] of Object.entries(definitions)) if (!definition.angularName) definition.angularName = `Vf${definition.exportName}Directive`;

function assertMarkup(html, definition) {
  assert.match(html, new RegExp(`<${definition.tag}[^>]*${definition.hook}`));
  if (definition.type) assert.match(html, new RegExp(`type=["']${definition.type}["']`));
  if (definition.role) assert.match(html, new RegExp(`role=["']${definition.role}["']`));
}

function reactControl(createElement, Component, definition) {
  const props = { id: 'control', ...definition.reactProps };
  if (definition.select) return createElement(Component, props, createElement('option', { value: 'one' }, 'One'), createElement('option', { value: 'two' }, 'Two'));
  return createElement(Component, props, definition.content);
}

function vueInitialProps(props = {}) {
  const { defaultValue, defaultChecked, ...rest } = props;
  return {
    ...rest,
    ...(defaultValue !== undefined ? { value: defaultValue } : {}),
    ...(defaultChecked !== undefined ? { checked: defaultChecked } : {}),
  };
}

export function registerReactL2SsrTest(componentId) {
  const definition = definitions[componentId];
  if (!definition) throw new Error(`Unknown Layer 2 component: ${componentId}`);
  test(`React ${componentId} preserves its native semantic element during SSR`, async () => {
    const { createElement } = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const module = await import(`@vyrnforge/react/${componentId}`);
    const html = renderToStaticMarkup(reactControl(createElement, module[definition.exportName], definition));
    assertMarkup(html, definition);
  });
}

export function registerVueL2SsrTest(componentId) {
  const definition = definitions[componentId];
  if (!definition) throw new Error(`Unknown Layer 2 component: ${componentId}`);
  test(`Vue ${componentId} preserves its native semantic element during SSR`, async () => {
    const { createSSRApp, h } = await import('vue');
    const { renderToString } = await import('@vue/server-renderer');
    const module = await import(`@vyrnforge/vue/${componentId}`);
    const Component = module[definition.exportName];
    const props = { id: 'control', ...vueInitialProps(definition.reactProps) };
    const app = createSSRApp({ render: () => definition.select
      ? h(Component, props, () => [h('option', { value: 'one' }, 'One'), h('option', { value: 'two' }, 'Two')])
      : h(Component, props, definition.content ? () => definition.content : undefined) });
    const html = await renderToString(app);
    assertMarkup(html, definition);
  });
}

export function registerAngularL2SsrTest(componentId) {
  const definition = definitions[componentId];
  if (!definition) throw new Error(`Unknown Layer 2 component: ${componentId}`);
  test(`Angular ${componentId} decorates the authored native element during SSR`, async () => {
    await import('@angular/compiler');
    const { Component, provideZonelessChangeDetection } = await import('@angular/core');
    const { bootstrapApplication } = await import('@angular/platform-browser');
    const { renderApplication } = await import('@angular/platform-server');
    const module = await import(`@vyrnforge/angular/${componentId}`);
    const DirectiveClass = module[definition.angularName];
    class App {}
    Component({ selector: 'vf-l2-ssr-test', standalone: true, imports: [DirectiveClass], template: definition.angular })(App);
    const html = await renderApplication(
      (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
      { document: '<!doctype html><html><body><vf-l2-ssr-test></vf-l2-ssr-test></body></html>' }
    );
    assertMarkup(html, definition);
  });
}
