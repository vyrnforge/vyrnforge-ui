import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Alert } from '@vyrnforge/react/alert';
test('severity is independent of announcement and action semantics', () => {
  const staticHtml = renderToStaticMarkup(h(Alert, { severity: 'critical' }, 'Unavailable'));
  assert.match(staticHtml, /data-vf-feedback-severity="critical"/);
  assert.doesNotMatch(staticHtml, /role=|aria-live=/);
  const html = renderToStaticMarkup(h(Alert, { severity: 'success', announcement: 'polite', heading: 'Saved',
    actions: h('a', { href: '/details' }, 'Details'), dismiss: { label: 'Dismiss', onDismiss() {} } }, 'Done'));
  assert.match(html, /data-vf-alert-message="" role="status"/);
  assert.match(html, /<\/div><div data-vf-alert-actions=""/);
  assert.match(html, /<button[^>]*aria-label="Dismiss"/);
});
