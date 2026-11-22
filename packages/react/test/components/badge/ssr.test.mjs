import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Badge } from '@vyrnforge/react/badge';
import { Badge as RootBadge } from '@vyrnforge/react';

test('Badge SSR retains readable text and consumer native attributes', () => {
  const html = renderToStaticMarkup(createElement(Badge, {
    id: 'draft', className: 'metadata', tone: 'accent', shape: 'rounded', size: 'sm',
  }, 'Draft'));
  assert.match(html, /^<span\b/);
  assert.match(html, /id="draft"/);
  assert.match(html, /class="metadata"/);
  assert.match(html, /data-vf-badge-tone="accent"/);
  assert.match(html, /data-vf-badge-size="sm"/);
  assert.match(html, /data-vf-badge-shape="rounded"/);
  assert.match(html, />Draft<\/span>$/);
  assert.doesNotMatch(html, /role=|aria-live=|tabindex=/i);
});

test('numeric zero is a label, not omitted or capped by Badge', () => {
  const zero = renderToStaticMarkup(createElement(RootBadge, null, 0));
  assert.match(zero, />0<\/span>$/);
  const count = renderToStaticMarkup(createElement(Badge, null, 12345));
  assert.match(count, />12345<\/span>$/);
});

test('named and decorative dots have distinct accessible semantics and no hidden text', () => {
  const named = renderToStaticMarkup(createElement(Badge, {
    appearance: 'dot', label: 'Sync in progress', tone: 'accent',
  }));
  assert.match(named, /role="img"/);
  assert.match(named, /aria-label="Sync in progress"/);
  assert.doesNotMatch(named, /aria-hidden|aria-live|tabindex/);
  const decorative = renderToStaticMarkup(createElement(Badge, {
    appearance: 'dot', decorative: true,
  }));
  assert.match(decorative, /aria-hidden="true"/);
  assert.doesNotMatch(decorative, /role=|aria-label=/);
});

test('Badge variants are deterministic and do not install interactive semantics', () => {
  for (const variant of ['subtle', 'outline']) {
    const html = renderToStaticMarkup(createElement(Badge, {
      tone: 'danger', size: 'md', variant, shape: 'pill',
    }, 'Blocked'));
    assert.match(html, new RegExp('data-vf-badge-variant="' + variant + '"'));
    assert.match(html, /data-vf-badge-tone="danger"/);
    assert.doesNotMatch(html, /aria-live|role="status"|tabindex=|<button/i);
  }
});
