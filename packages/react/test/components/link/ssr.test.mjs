import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link } from '@vyrnforge/react/link';
import { registerReactNativeControlSsrTest } from '../../../../../product/_test-support/native-controls/native-control-ssr.mjs';

await registerReactNativeControlSsrTest('link');

test('React Link composes the shared Text treatment on the native anchor only when requested', () => {
  const composed = renderToStaticMarkup(
    createElement(Link, { href: '/billing', textVariant: 'body-sm' }, 'Billing')
  );
  assert.match(composed, /^<a/);
  assert.match(composed, /href="\/billing"/);
  assert.match(composed, /data-vf-link=""/);
  assert.match(composed, /data-vf-text=""/);
  assert.match(composed, /data-vf-text-variant="body-sm"/);
  assert.match(composed, />Billing<\/a>$/);

  const defaultLink = renderToStaticMarkup(createElement(Link, { href: '/docs' }, 'Docs'));
  assert.match(defaultLink, /data-vf-link=""/);
  assert.doesNotMatch(defaultLink, /data-vf-text=/);
  assert.doesNotMatch(defaultLink, /data-vf-text-variant=/);
});
