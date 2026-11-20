import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Kbd } from '@vyrnforge/react/kbd';
import { Kbd as RootKbd } from '@vyrnforge/react';

test('Kbd root and subpath exports are identical', () => {
  assert.equal(Kbd, RootKbd);
});

test('Kbd retains native input-notation semantics without an interaction model', () => {
  const markup = renderToStaticMarkup(h(Kbd, {
    id: 'key', className: 'consumer-key', dir: 'ltr', title: 'Enter key',
  }, 'Enter'));
  assert.match(markup, /^<kbd /);
  assert.match(markup, /data-vf-kbd=""/);
  assert.match(markup, /class="consumer-key"/);
  assert.match(markup, />Enter<\/kbd>$/);
  assert.doesNotMatch(markup, /role=|tabindex=|data-vf-text/);
});

test('Kbd can compose the canonical Text variant without becoming interactive', () => {
  const markup = renderToStaticMarkup(h(Kbd, { variant: 'body-sm' }, 'Shift'));
  assert.match(markup, /data-vf-kbd=""/);
  assert.match(markup, /data-vf-text=""/);
  assert.match(markup, /data-vf-text-variant="body-sm"/);
  assert.doesNotMatch(markup, /\svariant=/);
});
