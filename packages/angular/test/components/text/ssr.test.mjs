import { test } from 'vitest';
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
  template: `
    <h2 vfText variant="heading-md" id="title">Typography</h2>
    <blockquote vfText variant="body-lg" cite="https://example.com/source">Quotation</blockquote>
    <time vfText variant="caption" datetime="2026-11-10">November 10</time>
    <mark vfText variant="body-md">Highlighted</mark>
  `
})(AppComponent);

test('Angular Text decorates approved authored native elements during SSR', async () => {
  const html = await renderApplication(
    (context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-text-ssr-test></vf-text-ssr-test></body></html>' }
  );

  assert.match(html, /<h2[^>]*id="title"/);
  assert.match(html, /data-vf-text-variant="heading-md"/);
  assert.match(html, /<blockquote[^>]*cite="https:\/\/example\.com\/source"/);
  assert.match(html, /data-vf-text-variant="body-lg"/);
  assert.match(html, /<time[^>]*datetime="2026-11-10"/);
  assert.match(html, /data-vf-text-variant="caption"/);
  assert.match(html, /<mark[^>]*data-vf-text/);
});
