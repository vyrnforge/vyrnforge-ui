import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';

test('Vue native semantic hosts can consume layout CSS recipes without a layout runtime', async () => {
  const html = await renderToString(createSSRApp({ render: () => h('main', null, [
    h('section', { 'data-vf-flow': '', 'data-vf-flow-gap': 'lg', 'aria-label': 'Settings' }, [
      h('ul', { 'data-vf-auto-grid': '' }, [h('li', 'One'), h('li', 'Two')]),
      h('nav', { 'data-vf-flow': '', 'data-vf-flow-direction': 'inline', 'data-vf-flow-wrap': 'wrap', 'aria-label': 'Actions' }, [h('a', { href: '#one' }, 'One')]),
    ]),
  ]) }));
  assert.match(html, /<main/);
  assert.match(html, /data-vf-auto-grid/);
  assert.match(html, /data-vf-flow-direction="inline"/);
  assert.match(html, /aria-label="Actions"/);
  assert.doesNotMatch(html, /data-vf-(stack|inline|cluster|container|control-group)(?:\s|=)/);
});
