import { test } from 'vitest';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import {
  VfComboboxContentDirective,
  VfComboboxInputDirective,
  VfComboboxOptionDirective,
  VfComboboxRootDirective,
} from '@vyrnforge/angular/combobox';

const imports = [
  VfComboboxRootDirective,
  VfComboboxInputDirective,
  VfComboboxContentDirective,
  VfComboboxOptionDirective,
];

class ExplicitIdApp {}
Component({
  selector: 'vf-combobox-explicit-id-test',
  standalone: true,
  imports,
  template: `
    <div vfComboboxRoot id="framework-combobox" defaultValue="React">
      <input vfComboboxInput aria-label="Framework">
      <div vfComboboxContent>
        <button vfComboboxOption="React">React</button>
        <button vfComboboxOption="Vue">Vue</button>
      </div>
    </div>
  `,
})(ExplicitIdApp);

class GeneratedIdApp {}
Component({
  selector: 'vf-combobox-generated-id-test',
  standalone: true,
  imports,
  template: `
    <div vfComboboxRoot>
      <input vfComboboxInput aria-label="First framework">
      <div vfComboboxContent><button vfComboboxOption="React">React</button></div>
    </div>
    <div vfComboboxRoot>
      <input vfComboboxInput aria-label="Second framework">
      <div vfComboboxContent><button vfComboboxOption="Vue">Vue</button></div>
    </div>
  `,
})(GeneratedIdApp);

function openingTag(html, id) {
  return html.match(new RegExp(`<[^>]+id="${id}"[^>]*>`))?.[0] ?? '';
}

function attribute(tag, name) {
  return tag.match(new RegExp(`${name}="([^"]+)"`))?.[1] ?? '';
}

async function render(component, selector) {
  return renderApplication(
    (context) => bootstrapApplication(component, { providers: [provideZonelessChangeDetection()] }, context),
    { document: `<!doctype html><html><body><${selector}></${selector}></body></html>` },
  );
}

test('Angular Combobox preserves an explicit root id across owned relationships', async () => {
  const html = await render(ExplicitIdApp, 'vf-combobox-explicit-id-test');
  const root = openingTag(html, 'framework-combobox');
  const input = openingTag(html, 'framework-combobox-input');
  const listbox = openingTag(html, 'framework-combobox-listbox');

  assert.match(root, /data-vf-combobox-root/);
  assert.match(input, /role="combobox"/);
  assert.match(input, /aria-controls="framework-combobox-listbox"/);
  assert.match(listbox, /role="listbox"/);
  assert.match(listbox, /aria-labelledby="framework-combobox-input"/);
  assert.match(html, /id="framework-combobox-listbox-option-1"/);
});

test('Angular Combobox generates unique deterministic relationship ids per application', async () => {
  const firstHtml = await render(GeneratedIdApp, 'vf-combobox-generated-id-test');
  const secondHtml = await render(GeneratedIdApp, 'vf-combobox-generated-id-test');

  const rootTags = (html) => [...html.matchAll(/<div[^>]*data-vf-combobox-root[^>]*>/g)].map((match) => match[0]);
  const firstIds = rootTags(firstHtml).map((tag) => attribute(tag, 'id'));
  const secondIds = rootTags(secondHtml).map((tag) => attribute(tag, 'id'));

  assert.equal(firstIds.length, 2);
  assert.ok(firstIds.every(Boolean));
  assert.notEqual(firstIds[0], firstIds[1]);
  assert.deepEqual(firstIds, secondIds);

  for (const rootId of firstIds) {
    const input = openingTag(firstHtml, `${rootId}-input`);
    const listbox = openingTag(firstHtml, `${rootId}-listbox`);
    assert.match(input, new RegExp(`aria-controls="${rootId}-listbox"`));
    assert.match(listbox, new RegExp(`aria-labelledby="${rootId}-input"`));
  }
});
