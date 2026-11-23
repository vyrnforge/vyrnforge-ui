import { registerVueNativeControlSsrTest } from '../../../../../product/_test-support/native-controls/native-control-ssr.mjs';
await registerVueNativeControlSsrTest('toggle-button');

import { test, expect } from 'vitest';

test('Vue icon-only ToggleButton SSR preserves the named native pressed button', async () => {
  const { createSSRApp, h } = await import('vue');
  const { renderToString } = await import('@vue/server-renderer');
  const { ToggleButton } = await import('@vyrnforge/vue/toggle-button');
  const html = await renderToString(createSSRApp({ render: () =>
    h(ToggleButton, { iconOnly: true, pressed: true, 'aria-label': 'Pin document' },
      () => h('svg', { 'aria-hidden': 'true' })) }));
  expect(html).toContain('data-vf-icon-only');
  expect(html).toContain('aria-pressed="true"');
  expect(html).toContain('aria-label="Pin document"');
});
