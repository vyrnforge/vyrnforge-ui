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

test('Angular Toast renders real server semantics without starting dismissal work', async () => {
  let openChangeRequests = 0;
  class ToastSsrApp {
    changed() { openChangeRequests += 1; }
  }
  Component({
    selector: 'vf-toast-ssr-test',
    standalone: true,
    imports: [VfToastViewportDirective, VfToastRootDirective, VfToastTitleDirective, VfToastDescriptionDirective, VfToastCloseDirective],
    template: '<div vfToastViewport><div vfToastRoot [duration]="10" (openChange)="changed()"><div vfToastTitle>Tersimpan</div><div vfToastDescription>Perubahan tersedia.</div><button vfToastClose aria-label="Tutup notifikasi">×</button></div></div>',
  })(ToastSsrApp);

  const html = await renderApplication(
    (context) => bootstrapApplication(ToastSsrApp, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-toast-ssr-test></vf-toast-ssr-test></body></html>' },
  );

  assert.match(html, /aria-live="polite"/);
  assert.match(html, /data-vf-toast-root=""/);
  assert.match(html, /aria-label="Tutup notifikasi"/);
  assert.doesNotMatch(html, /Dismiss notification/);
  assert.equal(openChangeRequests, 0);
});
