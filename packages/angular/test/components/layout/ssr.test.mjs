import test from 'node:test';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfContainerDirective, VfStackDirective } from '@vyrnforge/angular/layout';

class AppComponent {}
Component({
  selector: 'vf-layout-ssr-test',
  standalone: true,
  imports: [VfContainerDirective, VfStackDirective],
  template: '<main id="container" vfContainer vfContainerSize="lg" vfContainerGutter="md"><section id="stack" vfStack vfStackGap="lg" vfStackAlign="start">Content</section></main>'
})(AppComponent);

test('Angular layout directives decorate authored semantic elements during SSR', async () => {
  const html = await renderApplication(
    (context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-layout-ssr-test></vf-layout-ssr-test></body></html>' }
  );
  assert.match(html, /<main[^>]*id="container"/);
  assert.match(html, /data-vf-container-size="lg"/);
  assert.match(html, /data-vf-container-gutter="md"/);
  assert.match(html, /<section[^>]*id="stack"/);
  assert.match(html, /data-vf-stack-gap="lg"/);
  assert.match(html, />Content<\/section>/);
});
