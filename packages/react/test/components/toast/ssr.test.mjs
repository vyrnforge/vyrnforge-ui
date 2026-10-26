import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ToastClose, ToastDescription, ToastRoot, ToastTitle, ToastViewport } from '@vyrnforge/react/toast';

test('React Toast server render emits stable semantics without client effects', () => {
  let requested = 0;
  const html = renderToString(
    React.createElement(ToastViewport, { id: 'viewport' },
      React.createElement(ToastRoot, { id: 'toast', open: true, duration: 1, onOpenChange: () => { requested += 1; } },
        React.createElement(ToastTitle, null, 'Saved'),
        React.createElement(ToastDescription, null, 'Your changes are available.'),
        React.createElement(ToastClose, { 'aria-label': 'Tutup notifikasi' }, '×'),
      ),
    ),
  );
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /role="status"/);
  assert.match(html, /data-vf-toast-root=""/);
  assert.match(html, /aria-label="Tutup notifikasi"/);
  assert.equal(requested, 0);
});
