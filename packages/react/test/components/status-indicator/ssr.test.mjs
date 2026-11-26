import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StatusIndicator } from '@vyrnforge/react/status-indicator';
test('native readable status without automatic live region', () => {
  const html = renderToStaticMarkup(h(StatusIndicator, { severity: 'critical' }, 'Unavailable'));
  assert.match(html, /data-vf-feedback-severity="critical"/);
  assert.match(html, /data-vf-status-indicator-dot="" aria-hidden="true"/);
  assert.match(html, /Unavailable/);
  assert.doesNotMatch(html, /role=|aria-live=/);
});
