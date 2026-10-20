import test from 'node:test';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import {
  VfDialogBodyDirective,
  VfDialogCloseDirective,
  VfDialogDescriptionDirective,
  VfDialogRootDirective,
  VfDialogTitleDirective,
} from '@vyrnforge/angular/dialog';

class AppComponent {}
Component({
  selector: 'vf-dialog-ssr-test',
  standalone: true,
  imports: [
    VfDialogRootDirective,
    VfDialogTitleDirective,
    VfDialogDescriptionDirective,
    VfDialogBodyDirective,
    VfDialogCloseDirective,
  ],
  template: `
    <dialog vfDialogRoot id="profile-dialog" defaultOpen descriptionId="profile-dialog-description">
      <h2 vfDialogTitle>Edit profile</h2>
      <p vfDialogDescription id="profile-dialog-description">Update your profile.</p>
      <div vfDialogBody>Body</div>
      <button vfDialogClose>Close</button>
    </dialog>
  `,
})(AppComponent);

function openingTag(html, id) {
  return html.match(new RegExp(`<[^>]+id="${id}"[^>]*>`))?.[0] ?? '';
}

test('Angular Dialog SSR exposes intent and relationships without claiming native modality', async () => {
  const html = await renderApplication(
    (context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-dialog-ssr-test></vf-dialog-ssr-test></body></html>' },
  );

  const root = openingTag(html, 'profile-dialog');
  assert.match(root, /^<dialog\b/);
  assert.match(root, /data-vf-dialog-root/);
  assert.match(root, /data-vf-open/);
  assert.match(root, /aria-labelledby="profile-dialog-title"/);
  assert.match(root, /aria-describedby="profile-dialog-description"/);
  assert.doesNotMatch(root, /\sopen(?:=|\s|>)/);
  assert.doesNotMatch(root, /aria-modal=/);
  assert.match(html, /data-vf-dialog-title/);
  assert.match(html, /data-vf-dialog-description/);
  assert.match(html, /data-vf-dialog-body/);
  assert.match(html, /data-vf-dialog-close/);
});
