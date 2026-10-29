import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Portal } from '@vyrnforge/react/portal';

test('React Portal renders inline when no browser target exists during SSR', () => {
  const html = renderToStaticMarkup(createElement(Portal, null, createElement('span', { id: 'portal-child' }, 'Content')));
  assert.match(html, /id="portal-child"/);
});
