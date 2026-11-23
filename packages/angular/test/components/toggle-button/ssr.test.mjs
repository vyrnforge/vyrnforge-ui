import { registerAngularNativeControlSsrTest } from '../../../../../product/_test-support/native-controls/native-control-ssr.mjs';
await registerAngularNativeControlSsrTest('toggle-button');

import { test, expect } from 'vitest';

test('Angular icon-only ToggleButton SSR maps boolean input to square mode without changing semantics', async () => {
  await import('@angular/compiler');
  const { Component, provideZonelessChangeDetection } = await import('@angular/core');
  const { bootstrapApplication } = await import('@angular/platform-browser');
  const { renderApplication } = await import('@angular/platform-server');
  const { VfToggleButtonDirective } = await import('@vyrnforge/angular/toggle-button');
  class App {}
  Component({ selector: 'vf-icon-toggle-ssr', standalone: true,
    imports: [VfToggleButtonDirective],
    template: '<button vfToggleButton iconOnly type="button" aria-label="Pin document"><svg aria-hidden="true"></svg></button>' })(App);
  const html = await renderApplication((ctx) => bootstrapApplication(App,
    { providers: [provideZonelessChangeDetection()] }, ctx),
    { document: '<!doctype html><html><body><vf-icon-toggle-ssr></vf-icon-toggle-ssr></body></html>' });
  expect(html).toContain('data-vf-icon-only=""');
  expect(html).toContain('aria-pressed="false"');
  expect(html).toContain('aria-label="Pin document"');
});
