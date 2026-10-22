import test from 'node:test';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfVisuallyHiddenDirective } from '@vyrnforge/angular/visually-hidden';
class AppComponent {}
Component({ selector: 'vf-visually-hidden-ssr-test', standalone: true, imports: [VfVisuallyHiddenDirective], template: '<span id="hidden-label" vfVisuallyHidden>Notifications</span>' })(AppComponent);
test('Angular VisuallyHidden preserves accessible content during SSR', async () => { const html = await renderApplication((context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html><body><vf-visually-hidden-ssr-test></vf-visually-hidden-ssr-test></body></html>' }); assert.match(html, /<span[^>]*id="hidden-label"/); assert.match(html, /data-vf-visually-hidden=""/); assert.match(html, />Notifications<\/span>/); assert.doesNotMatch(html, /aria-hidden| hidden=| inert=/); });
