import test from 'node:test';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfButtonDirective } from '../../packages/angular/dist/button.js';

class AppComponent {}
Component({
  selector: 'vf-button-ssr-test',
  standalone: true,
  imports: [VfButtonDirective],
  template: '<button vfButton loading name="save" value="yes">Save</button>'
})(AppComponent);

test('Angular Button server output keeps a native form-participating button', async () => {
  const html = await renderApplication(
    () => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }),
    { document: '<!doctype html><html><body><vf-button-ssr-test></vf-button-ssr-test></body></html>' }
  );
  assert.match(html, /<button[^>]*data-vf-button/);
  assert.match(html, /data-vf-loading=""/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /name="save"/);
  assert.doesNotMatch(html, /<button[^>]*disabled/);
});
