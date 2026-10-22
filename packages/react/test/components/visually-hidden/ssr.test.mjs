import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { VisuallyHidden } from '@vyrnforge/react/visually-hidden';
test('React VisuallyHidden preserves accessible content during SSR', () => { const html = renderToStaticMarkup(createElement(VisuallyHidden, { id: 'hidden-label' }, 'Notifications')); assert.match(html, /^<span/); assert.match(html, /data-vf-visually-hidden=""/); assert.match(html, />Notifications<\/span>$/); assert.doesNotMatch(html, /aria-hidden| hidden=| inert=/); });
