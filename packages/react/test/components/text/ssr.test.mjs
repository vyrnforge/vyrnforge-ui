import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Text } from '@vyrnforge/react/text';

test('React Text preserves approved native semantics and typography roles during SSR', () => {
  const heading = renderToStaticMarkup(createElement(Text, { as: 'h2', variant: 'heading-md', id: 'title' }, 'Typography'));
  assert.match(heading, /^<h2/);
  assert.match(heading, /id="title"/);
  assert.match(heading, /data-vf-text=""/);
  assert.match(heading, /data-vf-text-variant="heading-md"/);
  assert.match(heading, />Typography<\/h2>$/);

  const time = renderToStaticMarkup(createElement(Text, {
    as: 'time',
    variant: 'caption',
    dateTime: '2026-11-10',
  }, 'November 10'));
  assert.match(time, /^<time/);
  assert.match(time, /datetime="2026-11-10"/);
  assert.match(time, /data-vf-text-variant="caption"/);

  const quote = renderToStaticMarkup(createElement(Text, {
    as: 'blockquote',
    variant: 'body-lg',
    cite: 'https://example.com/source',
  }, 'Quotation'));
  assert.match(quote, /^<blockquote/);
  assert.match(quote, /cite="https:\/\/example\.com\/source"/);
  assert.match(quote, /data-vf-text-variant="body-lg"/);
});
