import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from '@vyrnforge/react/dialog';

test('React Dialog SSR exposes intent and relationships without claiming native modality', () => {
  const html = renderToStaticMarkup(createElement(
    DialogRoot,
    { id: 'profile-dialog', defaultOpen: true, descriptionId: 'profile-dialog-description' },
    createElement(DialogTitle, null, 'Edit profile'),
    createElement(DialogDescription, { id: 'profile-dialog-description' }, 'Update your profile.'),
    createElement(DialogBody, null, 'Body'),
    createElement(DialogClose, null, 'Close'),
  ));

  assert.match(html, /^<dialog\b/);
  assert.match(html, /id="profile-dialog"/);
  assert.match(html, /data-vf-dialog-root=""/);
  assert.match(html, /data-vf-open=""/);
  assert.match(html, /aria-labelledby="profile-dialog-title"/);
  assert.match(html, /aria-describedby="profile-dialog-description"/);
  assert.match(html, /id="profile-dialog-title"[^>]*data-vf-dialog-title=""/);
  assert.match(html, /id="profile-dialog-description"[^>]*data-vf-dialog-description=""/);
  assert.match(html, /data-vf-dialog-body=""/);
  assert.match(html, /data-vf-dialog-close=""/);
  assert.doesNotMatch(html, /<dialog[^>]*\sopen(?:=|\s|>)/);
  assert.doesNotMatch(html, /aria-modal=/);
});

test('structured Dialog regions preserve authored attributes and native SSR visibility', () => {
  const html = renderToStaticMarkup(createElement(
    DialogRoot,
    { id: 'structured', descriptionId: 'details' },
    createElement(DialogHeader, { divider: true, className: 'custom-header' },
      createElement(DialogTitle, null, 'Details'),
      createElement(DialogDescription, { id: 'details' }, 'Description')),
    createElement(DialogBody, null, 'Content'),
    createElement(DialogFooter, null, createElement(DialogClose, null, 'Close')),
  ));
  assert.match(html, /data-vf-dialog-header="" data-vf-dialog-divider=""/);
  assert.match(html, /class="custom-header"/);
  assert.match(html, /data-vf-dialog-footer=""/);
  assert.doesNotMatch(html, /<dialog[^>]*\sopen(?:=|\s|>)/);
});
