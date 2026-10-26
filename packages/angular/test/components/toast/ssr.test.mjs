import test from 'node:test';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import {
  VfToastCloseDirective,
  VfToastDescriptionDirective,
  VfToastRootDirective,
  VfToastTitleDirective,
  VfToastViewportDirective,
} from '@vyrnforge/angular/toast';

test('Angular Toast server render emits stable semantics without client timer intent', async () => {
  let requested = 0;
  class App { onOpenChange() { requested += 1; } }
  Component({
    selector: 'vf-toast-ssr-test',
    standalone: true,
    imports: [VfToastViewportDirective, VfToastRootDirective, VfToastTitleDirective, VfToastDescriptionDirective, VfToastCloseDirective],
    template: '<div vfToastViewport id="viewport"><div vfToastRoot id="toast" [open]="true" [duration]="1" (openChange)="onOpenChange()"><div vfToastTitle>Saved</div><div vfToastDescription>Your changes are available.</div><button vfToastClose aria-label="Tutup notifikasi">×</button></div></div>',
  })(App);
  const html = await renderApplication(
    (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-toast-ssr-test></vf-toast-ssr-test></body></html>' },
  );
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /role="status"/);
  assert.match(html, /data-vf-toast-root=""/);
  assert.match(html, /aria-label="Tutup notifikasi"/);
  assert.equal(requested, 0);
});
