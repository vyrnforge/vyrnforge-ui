import test from 'node:test';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfPresenceDirective } from '@vyrnforge/angular/presence';
class App { present = true; }
Component({ selector: 'vf-presence-ssr-test', standalone: true, imports: [VfPresenceDirective], template: '<ng-template [vfPresence]="present" let-state><div [attr.data-state]="state">Content</div></ng-template>' })(App);
test('Angular Presence is server-safe and renders entered content', async () => {
  const html = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html><body><vf-presence-ssr-test></vf-presence-ssr-test></body></html>' });
  assert.match(html, /data-state="entered"/);
});
