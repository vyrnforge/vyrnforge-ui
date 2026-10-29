import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { DialogBody, DialogClose, DialogDescription, DialogRoot, DialogTitle } from '@vyrnforge/vue/dialog';

test('Vue Dialog SSR exposes intent and relationships without claiming native modality', async () => {
  const app = createSSRApp({
    render: () => h(DialogRoot, {
      id: 'profile-dialog',
      defaultOpen: true,
      descriptionId: 'profile-dialog-description',
    }, () => [
      h(DialogTitle, {}, () => 'Edit profile'),
      h(DialogDescription, { id: 'profile-dialog-description' }, () => 'Update your profile.'),
      h(DialogBody, {}, () => 'Body'),
      h(DialogClose, {}, () => 'Close'),
    ]),
  });
  const html = await renderToString(app);
  assert.match(html, /^<dialog\b/);
  assert.match(html, /id="profile-dialog"/);
  assert.match(html, /data-vf-dialog-root(?:="")?/);
  assert.match(html, /data-vf-open(?:="")?/);
  assert.match(html, /aria-labelledby="profile-dialog-title"/);
  assert.match(html, /aria-describedby="profile-dialog-description"/);
  assert.match(html, /data-vf-dialog-title/);
  assert.match(html, /data-vf-dialog-description/);
  assert.match(html, /data-vf-dialog-body/);
  assert.match(html, /data-vf-dialog-close/);
  assert.doesNotMatch(html, /<dialog[^>]*\sopen(?:=|\s|>)/);
  assert.doesNotMatch(html, /aria-modal=/);
});
