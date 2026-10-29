import { test } from 'vitest';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfPortalDirective } from '@vyrnforge/angular/portal';
class App {}
Component({ selector: 'vf-portal-ssr-test', standalone: true, imports: [VfPortalDirective], template: '<ng-template [vfPortal]="null"><span id="portal-child">Content</span></ng-template>' })(App);
test('Angular Portal retains inline content when no target is supplied during SSR', async () => {
  const html = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html><body><vf-portal-ssr-test></vf-portal-ssr-test></body></html>' });
  assert.match(html, /id="portal-child"/);
});
