import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Button } from '@vyrnforge/vue/button';

test('Vue Button server output is native-complete and preserves native attributes', async () => {
  const app = createSSRApp({ render: () => h(Button, { loading: true, name: 'save', value: 'yes' }, () => 'Save') });
  const html = await renderToString(app);
  assert.match(html, /^<button/);
  assert.match(html, /\sdata-vf-button(?:\s|>)/);
  assert.match(html, /\sdata-vf-loading(?:\s|>)/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /name="save"/);
  assert.doesNotMatch(html, /disabled/);
});
