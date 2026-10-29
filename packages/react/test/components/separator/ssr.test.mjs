import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Separator } from '@vyrnforge/react/separator';
test('React Separator preserves native hr semantics during SSR', () => { const html = renderToStaticMarkup(createElement(Separator, { id: 'divider', orientation: 'vertical' })); assert.match(html, /^<hr/); assert.match(html, /data-vf-separator=""/); assert.match(html, /data-vf-separator-orientation="vertical"/); assert.match(html, /aria-orientation="vertical"/); });
