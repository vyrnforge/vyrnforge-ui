import { test } from 'vitest';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfTextareaDirective } from '@vyrnforge/angular/textarea';

class AppComponent {}
Component({
  selector: 'vf-textarea-ssr-test',
  standalone: true,
  imports: [VfTextareaDirective],
  template: '<label for="notes">Notes</label><textarea vfTextarea id="notes" name="notes" rows="4" cols="30" wrap="soft" required readonly aria-describedby="help">alpha\nbeta</textarea><p id="help">Account notes</p>'
})(AppComponent);

test('Angular Textarea decorates the authored native textarea during SSR', async () => {
  const html = await renderApplication(
    (context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-textarea-ssr-test></vf-textarea-ssr-test></body></html>' }
  );
  assert.match(html, /<textarea[^>]*data-vf-textarea/);
  assert.match(html, /rows="4"/);
  assert.match(html, /cols="30"/);
  assert.match(html, /wrap="soft"/);
  assert.match(html, /required/);
  assert.match(html, /readonly/);
  assert.match(html, /aria-describedby="help"/);
});
