import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Text } from '@vyrnforge/vue/text';

test('Vue Text preserves approved native semantics and typography roles during SSR', async () => {
  const html = await renderToString(createSSRApp({
    render: () => h('div', null, [
      h(Text, { as: 'h3', variant: 'title-md', id: 'section-title' }, () => 'Section'),
      h(Text, { as: 'blockquote', variant: 'body-lg', cite: 'https://example.com/source' }, () => 'Quotation'),
      h(Text, { as: 'time', variant: 'caption', datetime: '2026-11-10' }, () => 'November 10'),
      h(Text, { as: 'mark', variant: 'body-md' }, () => 'Highlighted'),
    ])
  }));

  assert.match(html, /<h3[^>]*id="section-title"/);
  assert.match(html, /data-vf-text-variant="title-md"/);
  assert.match(html, /<blockquote[^>]*cite="https:\/\/example\.com\/source"/);
  assert.match(html, /data-vf-text-variant="body-lg"/);
  assert.match(html, /<time[^>]*datetime="2026-11-10"/);
  assert.match(html, /data-vf-text-variant="caption"/);
  assert.match(html, /<mark[^>]*data-vf-text/);
});
