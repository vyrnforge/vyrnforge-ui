import test from 'node:test';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfTextDirective } from '@vyrnforge/angular/text';

class AppComponent {}
Component({
  selector: 'vf-text-ssr-test',
  standalone: true,
  imports: [VfTextDirective],
  template: '<h2 vfText="heading" id="title">Typography</h2>'
})(AppComponent);

test('Angular Text decorates the authored native element during SSR', async () => {
  const html = await renderApplication(
    (context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-text-ssr-test></vf-text-ssr-test></body></html>' }
  );
  assert.match(html, /<h2[^>]*id="title"/);
  assert.match(html, /data-vf-text/);
  assert.match(html, /data-vf-text-variant="heading"/);
  assert.match(html, />Typography<\/h2>/);
});
