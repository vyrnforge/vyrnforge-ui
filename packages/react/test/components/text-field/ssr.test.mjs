import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TextField } from '@vyrnforge/react/text-field';

test('TextField keeps native controls and authored relationships', () => {
  const html = renderToStaticMarkup(h(TextField, { label: 'Email', id: 'email', name: 'email', type: 'email', required: true,
    description: 'Help', error: 'Try again', 'aria-describedby': 'external external', defaultValue: 'x' }));
  assert.match(html, /<label for="email"/);
  assert.match(html, /<input[^>]*data-vf-input/);
  assert.match(html, /aria-invalid="true"/);
  const ids = html.match(/aria-describedby="([^"]+)"/)?.[1].split(' ');
  assert.equal(ids?.length, 3);
  assert.equal(ids[0], 'external');
  for (const id of ids.slice(1)) assert.ok(html.includes('id="' + id + '"'));
  assert.doesNotMatch(html, /role="alert"/);
  const multi = renderToStaticMarkup(h(TextField, { label: 'Notes', multiline: true, rows: 4, defaultValue: 'alpha', readOnly: true }));
  assert.match(multi, /<textarea[^>]*rows="4"/);
  assert.match(multi, /data-vf-textarea/);
  assert.match(multi, />alpha<\/textarea>/);
  assert.doesNotMatch(multi, /multiline=|autosize=/);
});
