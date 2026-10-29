import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Surface } from '@vyrnforge/react/surface';

test('React Surface preserves the authored semantic element and shared hook during SSR', () => {
  const html = renderToStaticMarkup(createElement(Surface, { as: 'article', id: 'surface', 'aria-label': 'Summary' }, 'Content'));
  assert.match(html, /^<article/);
  assert.match(html, /id="surface"/);
  assert.match(html, /data-vf-surface=""/);
  assert.match(html, /aria-label="Summary"/);
});
