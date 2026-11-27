import { registerReactNativeControlSsrTest } from '../../../../../product/_test-support/native-controls/native-control-ssr.mjs';
await registerReactNativeControlSsrTest('slider');

import { test } from 'vitest';
import assert from 'node:assert/strict';
test('Slider enhanced presentation preserves the native input on the server', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Slider } = await import('@vyrnforge/react/slider');
  const html = renderToStaticMarkup(createElement(Slider, { name: 'volume', defaultValue: 50, size: 'lg',
    orientation: 'vertical', marks: true, valueLabelDisplay: 'always' }));
  assert.match(html, /type="range"/);
  assert.match(html, /aria-orientation="vertical"/);
  assert.match(html, /data-vf-size="lg"/);
  assert.doesNotMatch(html, /data-vf-slider-enhanced/);
});

test('Slider tooltip config is not forwarded as an invalid native attribute', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Slider } = await import('@vyrnforge/react/slider');
  const html = renderToStaticMarkup(createElement(Slider, { 'aria-label': 'Volume', defaultValue: 50, tooltip: { display: 'always', arrow: true } }));
  assert.match(html, /type="range"/);
  assert.doesNotMatch(html, /\btooltip="/);
  assert.doesNotMatch(html, /data-vf-slider-thumb-anchor/);
});
