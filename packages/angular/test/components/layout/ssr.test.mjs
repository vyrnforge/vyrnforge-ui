import { test } from 'vitest';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';

class AppComponent {}
Component({
  selector: 'vf-layout-ssr-test',
  standalone: true,
  imports: [],
  template: `
    <main>
      <section data-vf-flow data-vf-flow-gap="lg" aria-label="Settings">
        <ul data-vf-auto-grid data-vf-auto-grid-gap="sm"><li>One</li><li>Two</li></ul>
        <nav data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" aria-label="Actions"><a href="#one">One</a></nav>
      </section>
    </main>
  `,
})(AppComponent);

test('Angular SSR preserves semantic HTML with CSS-only layout hooks, no directives', async () => {
  const html = await renderApplication(
    context => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-layout-ssr-test></vf-layout-ssr-test></body></html>' },
  );
  assert.match(html, /data-vf-flow/);
  assert.match(html, /data-vf-auto-grid/);
  assert.match(html, /aria-label="Actions"/);
  assert.doesNotMatch(html, /data-vf-(stack|inline|cluster|container|control-group)(?:\s|=)/);
});
