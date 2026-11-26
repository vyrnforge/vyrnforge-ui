import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AlertDialogRoot, AlertDialogHeader, AlertDialogTitle, AlertDialogBody, AlertDialogFooter } from '@vyrnforge/react/alert-dialog';

test('React AlertDialog structured regions are SSR-safe', () => {
  const html = renderToStaticMarkup(createElement(
    AlertDialogRoot,
    { id: 'structured', defaultOpen: true },
    createElement(AlertDialogHeader, { divider: true }, createElement(AlertDialogTitle, null, 'Details')),
    createElement(AlertDialogBody, null, 'Content'),
    createElement(AlertDialogFooter, null, 'Actions'),
  ));
  assert.match(html, /data-vf-dialog-header="" data-vf-dialog-divider=""/);
  assert.match(html, /data-vf-dialog-footer=""/);
  assert.doesNotMatch(html, /<dialog[^>]*\sopen(?:=|\s|>)/);
});
