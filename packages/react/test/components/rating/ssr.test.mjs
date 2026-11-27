import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Rating, RatingRoot } from '@vyrnforge/react/rating';

test('Rating preserves legacy export and renders native fractional choices', () => {
  assert.ok(RatingRoot);
  const html = renderToStaticMarkup(createElement(Rating, { defaultValue: 3.5, precision: 0.5, name: 'score', 'aria-label': 'Score' }));
  assert.equal((html.match(/type="radio"/g) ?? []).length, 10);
  assert.match(html, /value="3\.5"/);
  assert.equal((html.match(/checked=""/g) ?? []).length, 1);
});
test('display is non-interactive and preserves fractional paint', () => {
  const html = renderToStaticMarkup(createElement(Rating, { value: 4.75, readOnly: true, 'aria-label': '4.75 of 5' }));
  assert.match(html, /role="img"/);
  assert.match(html, /--_vf-rating-fill:75%/);
  assert.doesNotMatch(html, /type="radio"/);
});
