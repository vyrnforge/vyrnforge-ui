import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Progress } from '@vyrnforge/react/progress';

test('Progress is independently importable and preserves native semantics on the server', () => {
  const html = renderToStaticMarkup(createElement(Progress, { 'aria-label': 'Upload', value: 48, max: 100 }));
  assert.match(html, /<progress/);
  assert.match(html, /value="48"/);
  assert.doesNotMatch(renderToStaticMarkup(createElement(Progress, { 'aria-label': 'Preparing' })), / value=/);
});
