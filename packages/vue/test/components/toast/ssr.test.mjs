import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import {
  ToastClose,
  ToastDescription,
  ToastRoot,
  ToastTitle,
  ToastViewport,
} from '@vyrnforge/vue/toast';

test('Vue Toast renders real server semantics without starting dismissal work', async () => {
  let openChangeRequests = 0;
  const app = createSSRApp({
    render: () => h(ToastViewport, null, () => h(ToastRoot, {
      duration: 10,
      'onUpdate:open': () => { openChangeRequests += 1; },
    }, () => [
      h(ToastTitle, null, () => 'Tersimpan'),
      h(ToastDescription, null, () => 'Perubahan tersedia.'),
      h(ToastClose, { 'aria-label': 'Tutup notifikasi' }, () => '×'),
    ])),
  });
  const html = await renderToString(app);

  assert.match(html, /aria-live="polite"/);
  assert.match(html, /data-vf-toast-root(?:="")?(?:\s|>)/);
  assert.match(html, /aria-label="Tutup notifikasi"/);
  assert.doesNotMatch(html, /Dismiss notification/);
  assert.equal(openChangeRequests, 0);
});
