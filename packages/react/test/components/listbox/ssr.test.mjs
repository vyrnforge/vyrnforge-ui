import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ListboxOption, ListboxRoot } from '@vyrnforge/react/listbox';

function openingTag(html, id) {
  return html.match(new RegExp(`<[^>]+id="${id}"[^>]*>`))?.[0] ?? '';
}

test('React Listbox SSR exposes one initial sequential tab stop', () => {
  const html = renderToStaticMarkup(createElement(
    ListboxRoot,
    { id: 'items', defaultValue: 'one', 'aria-label': 'Choose an item' },
    createElement(ListboxOption, { id: 'one', value: 'one' }, 'One'),
    createElement(ListboxOption, { id: 'disabled', value: 'disabled', disabled: true }, 'Disabled'),
    createElement(ListboxOption, { id: 'three', value: 'three' }, 'Three'),
  ));

  const root = openingTag(html, 'items');
  assert.match(root, /role="listbox"/);
  assert.match(root, /tabindex="0"/);
  assert.match(openingTag(html, 'one'), /tabindex="-1"/);
  assert.match(openingTag(html, 'one'), /aria-selected="true"/);
  assert.match(openingTag(html, 'disabled'), /tabindex="-1"/);
  assert.match(openingTag(html, 'disabled'), /aria-disabled="true"/);
  assert.match(openingTag(html, 'three'), /tabindex="-1"/);
});
