import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Textarea } from '@vyrnforge/react/textarea';

test('React Textarea preserves native textarea semantics and attributes during SSR', () => {
  const html = renderToStaticMarkup(createElement(Textarea, { id: 'notes', name: 'notes', rows: 4, cols: 30, wrap: 'soft', required: true, readOnly: true, defaultValue: 'alpha\nbeta', 'aria-describedby': 'help' }));
  assert.match(html, /^<textarea/);
  assert.match(html, /data-vf-textarea=""/);
  assert.match(html, /rows="4"/);
  assert.match(html, /cols="30"/);
  assert.match(html, /wrap="soft"/);
  assert.match(html, /required=""/);
  assert.match(html, /readOnly=""|readonly=""/i);
  assert.match(html, /aria-describedby="help"/);
  assert.match(html, />alpha\nbeta<\/textarea>$/);
});
