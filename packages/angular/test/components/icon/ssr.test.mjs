import test from 'node:test';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfIconComponent } from '@vyrnforge/angular/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
class AppComponent { bookmark = bookmarkIcon; }
Component({ selector: 'vf-icon-ssr-test', standalone: true, imports: [VfIconComponent], template: '<vf-icon [icon]="bookmark" variant="filled" shape="sharp" label="Saved" />' })(AppComponent);

test('Angular Icon SSR emits the shared semantic SVG contract', async () => {
  const html = await renderApplication((context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html><body><vf-icon-ssr-test></vf-icon-ssr-test></body></html>' });
  assert.match(html, /data-vf-icon/);
  assert.match(html, /data-vf-variant="filled"/);
  assert.match(html, /data-vf-shape="sharp"/);
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Saved"/);
});
