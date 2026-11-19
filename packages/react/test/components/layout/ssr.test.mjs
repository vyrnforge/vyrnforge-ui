import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('React native semantic hosts can consume both layout CSS recipes without a layout runtime', () => {
  const html = renderToStaticMarkup(h('main', null,
    h('section', { 'data-vf-flow': '', 'data-vf-flow-gap': 'lg', 'aria-label': 'Settings' },
      h('ul', { 'data-vf-auto-grid': '', 'data-vf-auto-grid-gap': 'sm' },
        h('li', null, 'One'), h('li', null, 'Two')),
      h('nav', { 'data-vf-flow': '', 'data-vf-flow-direction': 'inline', 'data-vf-flow-wrap': 'wrap', 'aria-label': 'Actions' },
        h('a', { href: '#one' }, 'One'), h('a', { href: '#two' }, 'Two')))));
  assert.match(html, /<main>/);
  assert.match(html, /<ul data-vf-auto-grid/);
  assert.match(html, /<nav data-vf-flow/);
  assert.match(html, /aria-label="Actions"/);
  assert.doesNotMatch(html, /data-vf-(stack|inline|cluster|container|control-group)(?:\s|=)/);
});
