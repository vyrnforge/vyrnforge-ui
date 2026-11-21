import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Divider } from '@vyrnforge/react/divider';
import { Divider as RootDivider } from '@vyrnforge/react';

test('visual Divider is exactly a decorative span with horizontal defaults', () => {
  const html = renderToStaticMarkup(createElement(Divider, {
    id: 'rule', className: 'consumer-line', 'data-testid': 'visual-rule',
  }));
  assert.match(html, /^<span\b/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /data-vf-divider=""/);
  assert.match(html, /data-vf-divider-orientation="horizontal"/);
  assert.match(html, /class="consumer-line"/);
  assert.match(html, /id="rule"/);
  assert.match(html, /data-testid="visual-rule"/);
  assert.doesNotMatch(html, /role=|tabindex=|aria-orientation=/i);
  assert.doesNotMatch(html, /<hr|<div/i);
});

test('vertical orientation is visual-only, and root export matches', () => {
  const html = renderToStaticMarkup(createElement(RootDivider, { orientation: 'vertical' }));
  assert.match(html, /data-vf-divider-orientation="vertical"/);
  assert.match(html, /aria-hidden="true"/);
  assert.doesNotMatch(html, /role=|aria-orientation=|tabindex=/i);
});
