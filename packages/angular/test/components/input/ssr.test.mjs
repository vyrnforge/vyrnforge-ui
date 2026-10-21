import test from 'node:test';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfInputDirective } from '@vyrnforge/angular/input';

class AppComponent {}
Component({
  selector: 'vf-input-ssr-test',
  standalone: true,
  imports: [VfInputDirective],
  template: '<label for="email">Email</label><input vfInput type="email" id="email" name="email" required readonly value="a@example.com" aria-describedby="help"><p id="help">Account email</p>'
})(AppComponent);

test('Angular Input decorates the authored native input during SSR', async () => {
  const html = await renderApplication(
    (context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-input-ssr-test></vf-input-ssr-test></body></html>' }
  );
  assert.match(html, /<input[^>]*data-vf-input/);
  assert.match(html, /type="email"/);
  assert.match(html, /name="email"/);
  assert.match(html, /required/);
  assert.match(html, /readonly/);
  assert.match(html, /aria-describedby="help"/);
});
