import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Divider } from '@vyrnforge/react/divider';
import { Divider as RootDivider } from '@vyrnforge/react';

test('plain Divider keeps the exact decorative native span contract', () => {
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
  assert.doesNotMatch(html, /data-vf-divider-labeled|data-vf-divider-align|data-vf-divider-label/);
  assert.doesNotMatch(html, /role=|tabindex=|aria-orientation=/i);
  assert.doesNotMatch(html, /<hr|<div/i);
});

test('unlabeled vertical Divider and blank text retain decorative semantics', () => {
  const html = renderToStaticMarkup(createElement(RootDivider, { orientation: 'vertical', children: ' ' }));
  assert.match(html, /data-vf-divider-orientation="vertical"/);
  assert.match(html, /aria-hidden="true"/);
  assert.doesNotMatch(html, /data-vf-divider-labeled|data-vf-divider-label/);
  assert.doesNotMatch(html, /role=|aria-orientation=|tabindex=/i);
});

test('labeled Divider exposes native readable text and configured logical alignment', () => {
  for (const orientation of ['horizontal', 'vertical']) {
    for (const textAlign of ['start', 'center', 'end']) {
      const html = renderToStaticMarkup(createElement(Divider, {
        orientation, textAlign, children: '<OR&>',
      }));
      assert.match(html, new RegExp('data-vf-divider-orientation="' + orientation + '"'));
      assert.match(html, new RegExp('data-vf-divider-align="' + textAlign + '"'));
      assert.match(html, /data-vf-divider-labeled=""/);
      assert.match(html, /<span data-vf-divider-label="">&lt;OR&amp;&gt;<\/span>/);
      assert.doesNotMatch(html, /aria-hidden=|role=|aria-orientation=|tabindex=/i);
    }
  }
});

test('numeric zero is a meaningful text label; no child is not', () => {
  const zero = renderToStaticMarkup(createElement(RootDivider, { children: 0 }));
  assert.match(zero, /data-vf-divider-labeled=""/);
  assert.match(zero, /data-vf-divider-align="center"/);
  assert.match(zero, /<span data-vf-divider-label="">0<\/span>/);
  assert.doesNotMatch(zero, /aria-hidden=/);
  const plain = renderToStaticMarkup(createElement(Divider, { children: '' }));
  assert.match(plain, /aria-hidden="true"/);
  assert.doesNotMatch(plain, /data-vf-divider-labeled/);
});
