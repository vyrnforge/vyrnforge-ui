import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Text } from '@vyrnforge/vue/text';

test('Vue Text preserves the requested native element during SSR', async () => {
  const html = await renderToString(createSSRApp({ render: () => h(Text, { as: 'h3', variant: 'title', id: 'section-title' }, () => 'Section') }));
  assert.match(html, /^<h3/);
  assert.match(html, /id="section-title"/);
  assert.match(html, /data-vf-text(?:=""|(?=[\s>]))/);
  assert.match(html, /data-vf-text-variant="title"/);
  assert.match(html, />Section<\/h3>$/);
});
