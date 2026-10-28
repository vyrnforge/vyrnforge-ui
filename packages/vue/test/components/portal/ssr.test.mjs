import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Portal } from '@vyrnforge/vue/portal';

test('Vue Portal can remain inline during SSR when disabled', async () => {
  const app = createSSRApp({ render: () => h(Portal, { to: 'body', disabled: true }, () => h('span', { id: 'portal-child' }, 'Content')) });
  const html = await renderToString(app);
  assert.match(html, /id="portal-child"/);
});
