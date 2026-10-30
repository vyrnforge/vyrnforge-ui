import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { ListboxOption, ListboxRoot } from '@vyrnforge/vue/listbox';

function openingTag(html, id) {
  return html.match(new RegExp(`<[^>]+id="${id}"[^>]*>`))?.[0] ?? '';
}

test('Vue Listbox SSR exposes one initial sequential tab stop', async () => {
  const app = createSSRApp({
    render: () => h(ListboxRoot, { id: 'items', defaultValue: 'one', 'aria-label': 'Choose an item' }, () => [
      h(ListboxOption, { id: 'one', value: 'one' }, () => 'One'),
      h(ListboxOption, { id: 'disabled', value: 'disabled', disabled: true }, () => 'Disabled'),
      h(ListboxOption, { id: 'three', value: 'three' }, () => 'Three'),
    ]),
  });
  const html = await renderToString(app);

  const root = openingTag(html, 'items');
  assert.match(root, /role="listbox"/);
  assert.match(root, /tabindex="0"/);
  assert.match(openingTag(html, 'one'), /tabindex="-1"/);
  assert.match(openingTag(html, 'one'), /aria-selected="true"/);
  assert.match(openingTag(html, 'disabled'), /tabindex="-1"/);
  assert.match(openingTag(html, 'disabled'), /aria-disabled="true"/);
  assert.match(openingTag(html, 'three'), /tabindex="-1"/);
});
