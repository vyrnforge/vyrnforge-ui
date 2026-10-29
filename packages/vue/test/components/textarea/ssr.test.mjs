import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Textarea } from '@vyrnforge/vue/textarea';

test('Vue Textarea preserves native textarea semantics and attributes during SSR', async () => {
  const html = await renderToString(createSSRApp({
    render: () => h(Textarea, { id: 'notes', name: 'notes', rows: 4, cols: 30, wrap: 'soft', required: true, readonly: true, value: 'alpha\nbeta', 'aria-describedby': 'help' })
  }));
  assert.match(html, /^<textarea/);
  assert.match(html, /\bdata-vf-textarea(?:="")?(?=\s|>)/);
  assert.match(html, /rows="4"/);
  assert.match(html, /cols="30"/);
  assert.match(html, /wrap="soft"/);
  assert.match(html, /required/);
  assert.match(html, /readonly/);
  assert.match(html, /aria-describedby="help"/);
  assert.match(html, />alpha\nbeta<\/textarea>$/);
});
