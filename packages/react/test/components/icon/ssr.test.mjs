import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Icon, SvgIcon } from '@vyrnforge/react/icon';
import { SvgIcon as RootSvgIcon } from '@vyrnforge/react';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';

test('React Icon SSR preserves decorative and meaningful accessibility contracts', () => {
  const decorative = renderToStaticMarkup(createElement(Icon, { icon: bookmarkIcon }));
  assert.match(decorative, /aria-hidden="true"/);
  assert.match(decorative, /data-vf-variant="outlined"/);
  assert.match(decorative, /data-vf-shape="rounded"/);
  const meaningful = renderToStaticMarkup(createElement(Icon, { icon: bookmarkIcon, variant: 'filled', shape: 'sharp', label: 'Saved' }));
  assert.match(meaningful, /role="img"/);
  assert.match(meaningful, /aria-label="Saved"/);
  assert.doesNotMatch(meaningful, /aria-hidden/);
});

test('SvgIcon keeps a custom native SVG simple, decorative and token-ready', () => {
  const decorative = renderToStaticMarkup(createElement(SvgIcon,
    { size: 'lg', className: 'my-icon', style: { color: 'var(--vf-color-accent-background)' } },
    createElement('path', { d: 'M12 2 22 22H2Z', stroke: 'currentColor' })));
  assert.match(decorative, /viewBox="0 0 24 24"/);
  assert.match(decorative, /data-vf-icon=""/);
  assert.match(decorative, /data-vf-size="lg"/);
  assert.match(decorative, /aria-hidden="true"/);
  assert.match(decorative, /focusable="false"/);
  assert.match(decorative, /class="my-icon"/);
  assert.match(decorative, /var\(--vf-color-accent-background\)/);
  assert.match(decorative, /<path/);
  assert.doesNotMatch(decorative, /tabindex=/i);

  const named = renderToStaticMarkup(createElement(RootSvgIcon,
    { label: 'Custom symbol', viewBox: '0 0 48 48' },
    createElement('circle', { cx: 24, cy: 24, r: 18, fill: 'currentColor' })));
  assert.match(named, /viewBox="0 0 48 48"/);
  assert.match(named, /data-vf-size="md"/);
  assert.match(named, /aria-label="Custom symbol"/);
  assert.match(named, /role="img"/);
  assert.doesNotMatch(named, /aria-hidden/);
  assert.match(named, /<circle/);
});
