import { registerReactNativeControlSsrTest } from '../../../../../product/_test-support/native-controls/native-control-ssr.mjs';
await registerReactNativeControlSsrTest('toggle-button');

import { test, expect } from 'vitest';

test('React icon-only ToggleButton SSR preserves the accessible pressed native button', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { ToggleButton } = await import('@vyrnforge/react/toggle-button');
  const html = renderToStaticMarkup(createElement(ToggleButton,
    { iconOnly: true, pressed: true, 'aria-label': 'Pin document' },
    createElement('svg', { 'aria-hidden': true })));
  expect(html).toContain('data-vf-icon-only=""');
  expect(html).toContain('aria-pressed="true"');
  expect(html).toContain('aria-label="Pin document"');
});
