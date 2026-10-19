import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button } from '@vyrnforge/react/button';

test('React Button server output is native-complete and loading remains enabled', () => {
  const html = renderToStaticMarkup(createElement(Button, { loading: true, name: 'save', value: 'yes' }, 'Save'));
  assert.match(html, /^<button/);
  assert.match(html, /data-vf-button=""/);
  assert.match(html, /data-vf-variant="primary"/);
  assert.match(html, /data-vf-size="md"/);
  assert.match(html, /data-vf-loading=""/);
  assert.match(html, /aria-busy="true"/);
  assert.doesNotMatch(html, /disabled/);
  assert.match(html, />Save<\/button>$/);
});
