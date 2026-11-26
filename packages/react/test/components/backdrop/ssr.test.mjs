import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Backdrop } from '@vyrnforge/react/backdrop';
test('Backdrop is a server-safe decorative native div', () => {
  const html = renderToStaticMarkup(h(Backdrop, { id: 'scrim', hidden: true }));
  assert.match(html, /<div id="scrim" hidden="" aria-hidden="true" data-vf-backdrop=""><\/div>/);
  assert.doesNotMatch(html, /role=|tabindex=|aria-modal=/i);
});
