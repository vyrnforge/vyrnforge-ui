import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Text } from '@vyrnforge/react/text';

test('React Text preserves the requested native element during SSR', () => {
  const html = renderToStaticMarkup(createElement(Text, { as: 'h2', variant: 'heading', id: 'title' }, 'Typography'));
  assert.match(html, /^<h2/);
  assert.match(html, /id="title"/);
  assert.match(html, /data-vf-text=""/);
  assert.match(html, /data-vf-text-variant="heading"/);
  assert.match(html, />Typography<\/h2>$/);
});
