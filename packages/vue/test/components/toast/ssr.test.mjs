import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { ToastClose, ToastDescription, ToastRoot, ToastTitle, ToastViewport } from '@vyrnforge/vue/toast';

test('Vue Toast server render emits stable semantics without client effects', async () => {
  let requested = 0;
  const app = createSSRApp({
    render: () => h(ToastViewport, { id: 'viewport' }, () => [
      h(ToastRoot, { id: 'toast', open: true, duration: 1, 'onUpdate:open': () => { requested += 1; } }, () => [
        h(ToastTitle, null, () => 'Saved'),
        h(ToastDescription, null, () => 'Your changes are available.'),
        h(ToastClose, { 'aria-label': 'Tutup notifikasi' }, () => '×'),
      ]),
    ]),
  });
  const html = await renderToString(app);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /role="status"/);
  assert.match(html, /data-vf-toast-root(?:="")?(?=[ >])/);
  assert.match(html, /aria-label="Tutup notifikasi"/);
  assert.equal(requested, 0);
});
