import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Input } from '@vyrnforge/vue/input';

test('Vue Input preserves native input semantics and attributes during SSR', async () => {
  const html = await renderToString(createSSRApp({
    render: () => h(Input, { id: 'email', type: 'email', name: 'email', required: true, readonly: true, value: 'a@example.com', 'aria-describedby': 'help' })
  }));
  assert.match(html, /^<input/);
  assert.match(html, /\bdata-vf-input(?:="")?(?=\s|>)/);
  assert.match(html, /type="email"/);
  assert.match(html, /name="email"/);
  assert.match(html, /required/);
  assert.match(html, /readonly/);
  assert.match(html, /aria-describedby="help"/);
});
