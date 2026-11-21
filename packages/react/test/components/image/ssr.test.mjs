import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Image } from '@vyrnforge/react/image';

test('React Image renders exactly a native img with the shared Web hook and authored attributes', () => {
  const html = renderToStaticMarkup(createElement(Image, {
    id: 'photo',
    src: '/photo.webp',
    alt: 'Tree beside a lake',
    width: 640,
    height: 320,
    loading: 'lazy',
    decoding: 'async',
    fetchPriority: 'low',
    referrerPolicy: 'no-referrer',
    className: 'consumer-image',
    'aria-describedby': 'caption',
  }));
  assert.match(html, /^<img\b/);
  assert.match(html, /data-vf-image=""/);
  assert.match(html, /alt="Tree beside a lake"/);
  assert.match(html, /width="640"/);
  assert.match(html, /height="320"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /decoding="async"/);
  assert.match(html, /fetchPriority="low"|fetchpriority="low"/);
  assert.match(html, /referrerPolicy="no-referrer"|referrerpolicy="no-referrer"/);
  assert.match(html, /class="consumer-image"/);
  assert.match(html, /aria-describedby="caption"/);
  assert.doesNotMatch(html, /<div|<span/);
});

test('React Image does not invent alternative text for decorative images', () => {
  const html = renderToStaticMarkup(createElement(Image, { src: '/ornament.svg', alt: '' }));
  assert.match(html, /alt=""/);
  assert.doesNotMatch(html, /aria-label=|role=|tabindex=/);
});
