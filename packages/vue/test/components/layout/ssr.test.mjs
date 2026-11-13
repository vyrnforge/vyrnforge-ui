import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { AspectRatio, Cluster, Container, ControlGroup, Field, Fieldset, Grid, Inline, RadioGroup, Stack } from '@vyrnforge/vue/layout';

test('Vue SSR preserves all ten L3 composition contracts without manufacturing behavior', async () => {
  const html = await renderToString(createSSRApp({
    render: () => h(Container, { as: 'main', id: 'container', size: 'lg', gutter: 'md' }, () => [
      h(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start' }, () => [
        h(Grid, { as: 'section', id: 'grid', gap: 'md' }, () => 'Cards'),
        h(Inline, { id: 'inline', gap: 'sm' }, () => 'Inline'),
        h(Cluster, { id: 'cluster', gap: 'sm', align: 'center' }, () => 'Actions'),
        h(AspectRatio, { id: 'ratio', ratio: 'video' }),
        h(Field, { id: 'field', gap: 'xs' }, () => [h('label', { for: 'email' }, 'Email'), h('input', { id: 'email' })]),
        h(Fieldset, { id: 'fieldset', gap: 'sm' }, () => [h('legend', null, 'Profile'), h('input', { name: 'displayName' })]),
        h(ControlGroup, { id: 'control-group', orientation: 'vertical' }, () => [h('button', { type: 'button' }, 'Previous'), h('button', { type: 'button' }, 'Next')]),
        h(RadioGroup, { id: 'radio-group', gap: 'sm', orientation: 'horizontal' }, () => [h('legend', null, 'Plan'), h('label', null, [h('input', { type: 'radio', name: 'plan', value: 'basic' }), 'Basic'])]),
      ]),
    ]),
  }));

  for (const hook of ['container', 'stack', 'grid', 'inline', 'cluster', 'aspect-ratio', 'field', 'fieldset', 'control-group', 'radio-group']) {
    assert.match(html, new RegExp(`data-vf-${hook}`));
  }
  assert.match(html, /<fieldset[^>]*id="fieldset"/);
  assert.match(html, /<fieldset[^>]*id="radio-group"/);
  assert.match(html, /<legend>Profile<\/legend>/);
  assert.match(html, /<legend>Plan<\/legend>/);
  assert.doesNotMatch(html, /id="control-group"[^>]*role=/);
  assert.match(html, /data-vf-control-group-orientation="vertical"/);
  assert.match(html, /data-vf-radio-group-orientation="horizontal"/);
});
