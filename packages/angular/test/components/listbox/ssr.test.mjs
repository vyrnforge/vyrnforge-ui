import { test } from 'vitest';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfListboxOptionDirective, VfListboxRootDirective } from '@vyrnforge/angular/listbox';

class AppComponent {}
Component({
  selector: 'vf-listbox-ssr-test',
  standalone: true,
  imports: [VfListboxRootDirective, VfListboxOptionDirective],
  template: `
    <div id="items" vfListboxRoot defaultValue="one" aria-label="Choose an item">
      <div id="one" vfListboxOption="one">One</div>
      <div id="disabled" vfListboxOption="disabled" [disabled]="true">Disabled</div>
      <div id="three" vfListboxOption="three">Three</div>
    </div>
  `,
})(AppComponent);

function openingTag(html, id) {
  return html.match(new RegExp(`<[^>]+id="${id}"[^>]*>`))?.[0] ?? '';
}

test('Angular Listbox SSR exposes one initial sequential tab stop', async () => {
  const html = await renderApplication(
    (context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-listbox-ssr-test></vf-listbox-ssr-test></body></html>' },
  );

  const root = openingTag(html, 'items');
  assert.match(root, /role="listbox"/);
  assert.match(root, /tabindex="0"/);
  assert.match(openingTag(html, 'one'), /tabindex="-1"/);
  assert.match(openingTag(html, 'one'), /aria-selected="true"/);
  assert.match(openingTag(html, 'disabled'), /tabindex="-1"/);
  assert.match(openingTag(html, 'disabled'), /aria-disabled="true"/);
  assert.match(openingTag(html, 'three'), /tabindex="-1"/);
});
