import test from 'node:test';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfClusterDirective, VfContainerDirective, VfStackDirective } from '@vyrnforge/angular/layout';

class AppComponent {}
Component({
  selector: 'vf-layout-ssr-test',
  standalone: true,
  imports: [VfClusterDirective, VfContainerDirective, VfStackDirective],
  template: '<main id="container" vfContainer vfContainerSize="lg" vfContainerGutter="md"><section id="stack" vfStack vfStackGap="lg" vfStackAlign="start"><div id="cluster" vfCluster vfClusterGap="sm" vfClusterAlign="center">Actions</div></section></main>'
})(AppComponent);

test('Angular layout directives decorate authored semantic elements with distinct shared contracts during SSR', async () => {
  const html = await renderApplication(
    (context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-layout-ssr-test></vf-layout-ssr-test></body></html>' }
  );
  assert.match(html, /<main[^>]*id="container"/);
  assert.match(html, /data-vf-container-size="lg"/);
  assert.match(html, /<section[^>]*id="stack"/);
  assert.doesNotMatch(html, /data-vf-stack-direction/);
  assert.match(html, /<div[^>]*id="cluster"/);
  assert.match(html, /data-vf-cluster-gap="sm"/);
});
