import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Cluster, Container, Stack } from '@vyrnforge/vue/layout';

test('Vue layout primitives preserve semantic elements and emit distinct shared DOM contracts during SSR', async () => {
  const html = await renderToString(createSSRApp({
    render: () => h(Container, { as: 'main', id: 'container', size: 'lg', gutter: 'md' }, () => [
      h(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start' }, () => [
        h(Cluster, { id: 'cluster', gap: 'sm', align: 'center' }, () => 'Actions')
      ])
    ])
  }));
  assert.match(html, /^<main/);
  assert.match(html, /data-vf-container-size="lg"/);
  assert.match(html, /<section[^>]*data-vf-stack/);
  assert.doesNotMatch(html, /data-vf-stack-direction/);
  assert.match(html, /<div[^>]*data-vf-cluster/);
  assert.match(html, /data-vf-cluster-gap="sm"/);
});
