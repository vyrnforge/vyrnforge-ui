import test from 'node:test';
import assert from 'node:assert/strict';
import { loadNativeControlContract } from './native-control-contract.mjs';

function assertMarkup(html, contract) {
  assert.match(html, new RegExp(`<${contract.semantics.tag.toLowerCase()}(?:\\s|>)`));
  if (contract.semantics.type) assert.match(html, new RegExp(`type=(?:"|')${contract.semantics.type}(?:"|')`));
  if (contract.semantics.role) assert.match(html, new RegExp(`role=(?:"|')${contract.semantics.role}(?:"|')`));
}

function reactControl(createElement, Component, contract) {
  const props = { id: 'control', ...(contract.props ?? {}) };
  if (contract.select) return createElement(Component, props, createElement('option', { value: 'one' }, 'One'), createElement('option', { value: 'two' }, 'Two'));
  return createElement(Component, props, contract.content);
}

function vueInitialProps(props = {}) {
  const { defaultValue, defaultChecked, ...rest } = props;
  return { ...rest, ...(defaultValue !== undefined ? { value: defaultValue } : {}), ...(defaultChecked !== undefined ? { checked: defaultChecked } : {}) };
}

export async function registerReactNativeControlSsrTest(componentId) {
  const contract = await loadNativeControlContract(componentId);
  test(`React ${componentId} preserves its native semantic element during SSR`, async () => {
    const { createElement } = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const module = await import(`@vyrnforge/react/${componentId}`);
    const html = renderToStaticMarkup(reactControl(createElement, module[contract.exportName], contract));
    assertMarkup(html, contract);
  });
}

export async function registerVueNativeControlSsrTest(componentId) {
  const contract = await loadNativeControlContract(componentId);
  test(`Vue ${componentId} preserves its native semantic element during SSR`, async () => {
    const { createSSRApp, h } = await import('vue');
    const { renderToString } = await import('@vue/server-renderer');
    const module = await import(`@vyrnforge/vue/${componentId}`);
    const Component = module[contract.exportName];
    const props = { id: 'control', ...vueInitialProps(contract.props) };
    const app = createSSRApp({ render: () => contract.select
      ? h(Component, props, () => [h('option', { value: 'one' }, 'One'), h('option', { value: 'two' }, 'Two')])
      : h(Component, props, contract.content === undefined ? undefined : () => contract.content) });
    const html = await renderToString(app);
    assertMarkup(html, contract);
  });
}

export async function registerAngularNativeControlSsrTest(componentId) {
  const contract = await loadNativeControlContract(componentId);
  test(`Angular ${componentId} decorates the authored native element during SSR`, async () => {
    await import('@angular/compiler');
    const { Component, provideZonelessChangeDetection } = await import('@angular/core');
    const { bootstrapApplication } = await import('@angular/platform-browser');
    const { renderApplication } = await import('@angular/platform-server');
    const module = await import(`@vyrnforge/angular/${componentId}`);
    const DirectiveClass = module[contract.angularName];
    class App {}
    Component({ selector: 'vf-native-control-ssr-test', standalone: true, imports: [DirectiveClass], template: contract.angular })(App);
    const html = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html><body><vf-native-control-ssr-test></vf-native-control-ssr-test></body></html>' });
    assertMarkup(html, contract);
  });
}
