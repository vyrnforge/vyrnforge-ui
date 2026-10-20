import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/web/icon';

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
