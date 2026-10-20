import test from 'node:test';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import {
  VfTabsListDirective,
  VfTabsPanelDirective,
  VfTabsRootDirective,
  VfTabsTabDirective,
} from '@vyrnforge/angular/tabs';

class AppComponent {}
Component({
  selector: 'vf-tabs-ssr-test',
  standalone: true,
  imports: [VfTabsRootDirective, VfTabsListDirective, VfTabsTabDirective, VfTabsPanelDirective],
  template: `
    <div vfTabsRoot id="account-tabs" defaultValue="overview">
      <div vfTabsList aria-label="Account sections">
        <button vfTabsTab="overview">Overview</button>
        <button vfTabsTab="billing" disabled>Billing</button>
        <button vfTabsTab="security">Security</button>
      </div>
      <div vfTabsPanel="overview">Overview panel</div>
      <div vfTabsPanel="billing">Billing panel</div>
      <div vfTabsPanel="security">Security panel</div>
    </div>
  `,
})(AppComponent);

test('Angular Tabs server output contains complete tab relationships and state', async () => {
  const html = await renderApplication(
    (context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-tabs-ssr-test></vf-tabs-ssr-test></body></html>' },
  );
  assert.match(html, /data-vf-tabs-root/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /id="account-tabs-tab-overview"[^>]*role="tab"[^>]*tabindex="0"[^>]*aria-selected="true"/);
  assert.match(html, /id="account-tabs-tab-billing"[^>]*role="tab"[^>]*disabled[^>]*aria-disabled="true"/);
  assert.match(html, /id="account-tabs-panel-security"[^>]*role="tabpanel"[^>]*hidden[^>]*aria-labelledby="account-tabs-tab-security"/);
});
