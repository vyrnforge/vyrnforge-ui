import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { AutoGrid, Cluster, Container, ControlGroup, Inline, Stack } from '@vyrnforge/vue/layout';

test('Vue SSR preserves the six L3 composition contracts without manufacturing semantics', async () => {
  const html = await renderToString(createSSRApp({
    render: () => h(Container, { as: 'main', id: 'container', size: 'lg', gutter: 'md' }, () => [
      h(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start' }, () => [
        h(AutoGrid, { as: 'section', id: 'auto-grid', gap: 'md' }, () => 'Cards'),
        h(Inline, { id: 'inline', gap: 'sm' }, () => 'Inline'),
        h(Cluster, { id: 'cluster', gap: 'sm', align: 'center' }, () => 'Actions'),
        h(ControlGroup, { id: 'control-group', orientation: 'vertical' }, () => [h('button', { type: 'button' }, 'Previous'), h('button', { type: 'button' }, 'Next')]),
      ]),
    ]),
  }));

  for (const hook of ['container', 'stack', 'auto-grid', 'inline', 'cluster', 'control-group']) {
    assert.match(html, new RegExp(`data-vf-${hook}`));
  }
  for (const retired of ['grid', 'aspect-ratio', 'field', 'fieldset', 'radio-group']) {
    assert.doesNotMatch(html, new RegExp(`data-vf-${retired}(?:\\s|=)`));
  }
  assert.doesNotMatch(html, /id="control-group"[^>]*role=/);
  assert.match(html, /data-vf-control-group-orientation="vertical"/);
});
