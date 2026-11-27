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


test('autosize alone selects native textarea before hydration; false keeps input', () => {
  const html = renderToStaticMarkup(h(TextField, { label: 'Message', id: 'message', name: 'message', autosize: true, minRows: 1, maxRows: 6, labelPlacement: 'floating', defaultValue: 'First\nSecond' }));
  assert.match(html, /<textarea[^>]*rows="1"/);
  assert.match(html, /data-vf-textarea-autosize/);
  assert.match(html, /data-vf-text-field-always-raised/);
  assert.match(html, /<label for="message"/);
  assert.match(html, /First\nSecond<\/textarea>/);
  assert.doesNotMatch(html, /<input|multiline=|autosize="/);
  assert.match(renderToStaticMarkup(h(TextField, { label: 'Name', autosize: false })), /<input/);
});
