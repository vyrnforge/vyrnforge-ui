import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Icon } from '@vyrnforge/vue/icon';
import { bookmarkIcon } from '@vyrnforge/web/icon';

test('Vue Icon SSR preserves decorative and meaningful accessibility contracts', async () => {
  const decorative = await renderToString(createSSRApp({ render: () => h(Icon, { icon: bookmarkIcon }) }));
  assert.match(decorative, /aria-hidden="true"/);
  const meaningful = await renderToString(createSSRApp({ render: () => h(Icon, { icon: bookmarkIcon, variant: 'filled', shape: 'sharp', label: 'Saved' }) }));
  assert.match(meaningful, /role="img"/);
  assert.match(meaningful, /aria-label="Saved"/);
});
