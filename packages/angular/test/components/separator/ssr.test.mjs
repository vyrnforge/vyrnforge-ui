import { test } from 'vitest';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfSeparatorDirective } from '@vyrnforge/angular/separator';
class AppComponent {}
Component({ selector: 'vf-separator-ssr-test', standalone: true, imports: [VfSeparatorDirective], template: '<hr id="divider" vfSeparator [vfSeparatorOrientation]="\'vertical\'">' })(AppComponent);
test('Angular Separator decorates native hr semantics during SSR', async () => { const html = await renderApplication((context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html><body><vf-separator-ssr-test></vf-separator-ssr-test></body></html>' }); assert.match(html, /<hr[^>]*id="divider"/); assert.match(html, /data-vf-separator=""/); assert.match(html, /data-vf-separator-orientation="vertical"/); assert.match(html, /aria-orientation="vertical"/); });
