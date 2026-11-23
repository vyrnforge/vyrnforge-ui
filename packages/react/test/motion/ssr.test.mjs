import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Motion, Button } from '@vyrnforge/react';

test('React Motion renders a native SSR-safe wrapper around real controls', () => {
  const html = renderToStaticMarkup(createElement(Motion, {
    effect: 'fade-slide', direction: 'inline-start', duration: 480,
    as: 'section', id: 'animation-test', className: 'custom', dir: 'rtl',
    style: { color: 'red' }, 'aria-label': 'Introduction',
  }, createElement(Button, { type: 'button' }, 'Continue')));
  assert.match(html, /^<section/);
  assert.match(html, /data-vf-motion="fade-slide"/);
  assert.match(html, /data-vf-motion-direction="inline-start"/);
  assert.match(html, /--vf-motion-duration-enter:480ms/);
  assert.match(html, /color:red/);
  assert.match(html, /dir="rtl"/);
  assert.match(html, /<button/);
  assert.match(html, />Continue<\/button><\/section>$/);
});

test('React Motion inherits the Web default and validates invalid timing', () => {
  const html = renderToStaticMarkup(createElement(Motion, null, 'Hello'));
  assert.match(html, /^<div/);
  assert.match(html, /data-vf-motion="fade"/);
  assert.doesNotMatch(html, /--vf-motion-duration-enter/);
  assert.throws(() => renderToStaticMarkup(createElement(Motion, { duration: -1 }, 'Bad')), RangeError);
});
