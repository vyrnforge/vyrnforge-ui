import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DrawerRoot, DrawerHeader, DrawerTitle, DrawerBody, DrawerFooter } from '@vyrnforge/react/drawer';

test('React Drawer structured regions are SSR-safe', () => {
  const html = renderToStaticMarkup(createElement(
    DrawerRoot,
    { id: 'structured', defaultOpen: true },
    createElement(DrawerHeader, { divider: true }, createElement(DrawerTitle, null, 'Details')),
    createElement(DrawerBody, null, 'Content'),
    createElement(DrawerFooter, null, 'Actions'),
  ));
  assert.match(html, /data-vf-dialog-header="" data-vf-dialog-divider=""/);
  assert.match(html, /data-vf-dialog-footer=""/);
  assert.doesNotMatch(html, /<dialog[^>]*\sopen(?:=|\s|>)/);
});
