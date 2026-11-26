import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Loading, LoadingIndicator, LoadingPlaceholder, LoadingProgress, LoadingCustom } from '@vyrnforge/react/loading';
test('Loading React parts project the native Web hooks and preserve progress semantics without browser globals', () => {
  const html = renderToStaticMarkup(h(Loading, { size: 'sm', 'aria-busy': true },
    h(LoadingIndicator, { variant: 'dots' }),
    h(LoadingPlaceholder, { shape: 'line' }),
    h(LoadingProgress, { value: 48, max: 100, 'aria-label': 'Uploading' }),
    h(LoadingProgress, { 'aria-label': 'Preparing' }),
    h(LoadingCustom, { 'aria-hidden': true }, h('svg'))));
  assert.match(html, /data-vf-loading-size="sm"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /aria-hidden="true" data-vf-loading-indicator="" data-vf-loading-variant="dots"/);
  assert.match(html, /data-vf-loading-placeholder-shape="line"/);
  const progress = [...html.matchAll(/<progress[^>]*>/g)].map(match => match[0]);
  assert.equal(progress.length, 2);
  assert.match(progress[0], /value="48"/);
  assert.match(progress[0], /max="100"/);
  assert.doesNotMatch(progress[1], /\bvalue=/);
  assert.match(html, /data-vf-loading-custom=""/);
});
