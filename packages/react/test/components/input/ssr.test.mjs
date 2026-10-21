import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Input } from '@vyrnforge/react/input';

test('React Input preserves native input semantics and attributes during SSR', () => {
  const html = renderToStaticMarkup(createElement(Input, { id: 'email', type: 'email', name: 'email', required: true, readOnly: true, defaultValue: 'a@example.com', 'aria-describedby': 'help' }));
  assert.match(html, /^<input/);
  assert.match(html, /data-vf-input=""/);
  assert.match(html, /type="email"/);
  assert.match(html, /name="email"/);
  assert.match(html, /required=""/);
  assert.match(html, /readOnly=""|readonly=""/i);
  assert.match(html, /aria-describedby="help"/);
});
