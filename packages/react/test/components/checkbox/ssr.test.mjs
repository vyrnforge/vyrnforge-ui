import { registerReactNativeControlSsrTest } from '../../../../../product/_test-support/native-controls/native-control-ssr.mjs';
await registerReactNativeControlSsrTest('checkbox');

import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Checkbox } from '@vyrnforge/react/checkbox';
test('Checkbox visual size maps to shared native CSS without leaking numeric size', () => {
  for (const size of ['sm', 'md', 'lg']) {
    const html = renderToStaticMarkup(h(Checkbox, { size, name: 'choice', defaultChecked: true }));
    assert.match(html, new RegExp('data-vf-size="' + size + '"'));
    assert.doesNotMatch(html, /\ssize=/);
    assert.match(html, /type="checkbox"/);
  }
  assert.match(renderToStaticMarkup(h(Checkbox)), /data-vf-size="md"/);
});
