import { test } from 'vitest';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfSurfaceDirective } from '@vyrnforge/angular/surface';

class AppComponent {}
Component({ selector: 'vf-surface-ssr-test', standalone: true, imports: [VfSurfaceDirective], template: '<article id="surface" vfSurface aria-label="Summary">Content</article>' })(AppComponent);

test('Angular Surface decorates the authored semantic element with the shared hook during SSR', async () => {
  const html = await renderApplication((context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html><body><vf-surface-ssr-test></vf-surface-ssr-test></body></html>' });
  assert.match(html, /<article[^>]*id="surface"/);
  assert.match(html, /data-vf-surface=""/);
  assert.match(html, /aria-label="Summary"/);
});
