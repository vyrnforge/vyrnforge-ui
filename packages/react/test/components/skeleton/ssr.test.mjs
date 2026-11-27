import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Skeleton } from '@vyrnforge/react/skeleton';

test('Skeleton is independently importable and preserves native semantics on the server', () => {
  const html = renderToStaticMarkup(createElement(Skeleton, { shape: 'circle', animation: 'none' }));
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /data-vf-skeleton-shape="circle"/);
  assert.match(html, /data-vf-skeleton-animation="none"/);
});
