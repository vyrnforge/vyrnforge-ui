import { test } from 'vitest';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfClusterDirective, VfContainerDirective, VfGridDirective, VfStackDirective } from '@vyrnforge/angular/layout';

class AppComponent {}
Component({ selector: 'vf-layout-ssr-test', standalone: true, imports: [VfClusterDirective, VfContainerDirective, VfGridDirective, VfStackDirective], template: '<main id="container" vfContainer vfContainerSize="lg" vfContainerGutter="md"><section id="stack" vfStack vfStackGap="lg"><section id="grid" vfGrid vfGridGap="md">Cards</section><div id="cluster" vfCluster vfClusterGap="sm">Actions</div></section></main>' })(AppComponent);

test('Angular layout directives decorate authored semantic elements with distinct shared contracts during SSR', async () => {
  const html = await renderApplication((context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html><body><vf-layout-ssr-test></vf-layout-ssr-test></body></html>' });
  assert.match(html, /<main[^>]*id="container"/);
  assert.match(html, /data-vf-container-size="lg"/);
  assert.match(html, /<section[^>]*id="grid"[^>]*data-vf-grid/);
  assert.match(html, /data-vf-grid-gap="md"/);
  assert.match(html, /<div[^>]*id="cluster"/);
});
