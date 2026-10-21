import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Surface } from '@vyrnforge/vue/surface';

test('Vue Surface preserves the authored semantic element and shared hook during SSR', async () => {
  const html = await renderToString(createSSRApp({ render: () => h(Surface, { as: 'article', id: 'surface', 'aria-label': 'Summary' }, () => 'Content') }));
  assert.match(html, /^<article/);
  assert.match(html, /id="surface"/);
  assert.match(html, /data-vf-surface=""/);
  assert.match(html, /aria-label="Summary"/);
});
