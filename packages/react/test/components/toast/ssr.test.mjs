import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import {
  ToastClose,
  ToastDescription,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from '@vyrnforge/react/toast';

test('React Toast renders real server semantics without starting dismissal work', () => {
  let openChangeRequests = 0;
  const html = renderToString(createElement(
    ToastViewport,
    null,
    createElement(
      ToastRoot,
      { duration: 10, onOpenChange: () => { openChangeRequests += 1; } },
      createElement(ToastTitle, null, 'Tersimpan'),
      createElement(ToastDescription, null, 'Perubahan tersedia.'),
      createElement(ToastClose, { 'aria-label': 'Tutup notifikasi' }, '×'),
    ),
  ));

  assert.match(html, /aria-live="polite"/);
  assert.match(html, /data-vf-toast-root=""/);
  assert.match(html, /aria-label="Tutup notifikasi"/);
  assert.doesNotMatch(html, /Dismiss notification/);
  assert.equal(openChangeRequests, 0);
});
