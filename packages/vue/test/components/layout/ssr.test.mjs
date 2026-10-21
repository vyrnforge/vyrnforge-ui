import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Container, Stack } from '@vyrnforge/vue/layout';

test('Vue layout primitives preserve semantic elements and emit the shared DOM contract during SSR', async () => {
  const html = await renderToString(createSSRApp({
    render: () => h(Container, { as: 'main', id: 'container', size: 'lg', gutter: 'md' }, () => [
      h(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start' }, () => 'Content')
    ])
  }));
  assert.match(html, /^<main/);
  assert.match(html, /data-vf-container-size="lg"/);
  assert.match(html, /data-vf-container-gutter="md"/);
  assert.match(html, /<section[^>]*data-vf-stack/);
  assert.match(html, /data-vf-stack-gap="lg"/);
  assert.match(html, />Content<\/section><\/main>$/);
});
