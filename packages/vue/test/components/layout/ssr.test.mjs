import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Cluster, Container, Grid, Stack } from '@vyrnforge/vue/layout';

test('Vue layout primitives preserve semantic elements and emit distinct shared DOM contracts during SSR', async () => {
  const html = await renderToString(createSSRApp({ render: () => h(Container, { as: 'main', id: 'container', size: 'lg', gutter: 'md' }, () => [h(Stack, { as: 'section', id: 'stack', gap: 'lg' }, () => [h(Grid, { as: 'section', id: 'grid', gap: 'md' }, () => 'Cards'), h(Cluster, { id: 'cluster', gap: 'sm' }, () => 'Actions')])]) }));
  assert.match(html, /^<main/);
  assert.match(html, /data-vf-container-size="lg"/);
  assert.match(html, /<section[^>]*id="grid"[^>]*data-vf-grid/);
  assert.match(html, /data-vf-grid-gap="md"/);
  assert.match(html, /<div[^>]*data-vf-cluster/);
});
