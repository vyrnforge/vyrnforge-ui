import { test } from 'vitest';
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

const tabsImports = [VfTabsRootDirective, VfTabsListDirective, VfTabsTabDirective, VfTabsPanelDirective];

class AppComponent {}
Component({
  selector: 'vf-tabs-ssr-test',
  standalone: true,
  imports: tabsImports,
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

class GeneratedIdAppComponent {}
Component({
  selector: 'vf-tabs-generated-id-ssr-test',
  standalone: true,
  imports: tabsImports,
  template: `
    <div vfTabsRoot defaultValue="first">
      <div vfTabsList aria-label="First sections"><button vfTabsTab="first">First</button></div>
      <div vfTabsPanel="first">First panel</div>
    </div>
    <div vfTabsRoot defaultValue="second">
      <div vfTabsList aria-label="Second sections"><button vfTabsTab="second">Second</button></div>
      <div vfTabsPanel="second">Second panel</div>
    </div>
  `,
})(GeneratedIdAppComponent);

function openingTag(html, id) {
  return html.match(new RegExp(`<[^>]+id="${id}"[^>]*>`))?.[0] ?? '';
}

function attribute(tag, name) {
  return tag.match(new RegExp(`${name}="([^"]+)"`))?.[1] ?? '';
}

async function render(component, selector) {
  return renderApplication(
    (context) => bootstrapApplication(component, { providers: [provideZonelessChangeDetection()] }, context),
    { document: `<!doctype html><html><body><${selector}></${selector}></body></html>` },
  );
}

test('Angular Tabs server output contains complete tab relationships and state', async () => {
  const html = await render(AppComponent, 'vf-tabs-ssr-test');
  assert.match(html, /data-vf-tabs-root/);
  assert.match(html, /role="tablist"/);

  const overview = openingTag(html, 'account-tabs-tab-overview');
  assert.match(overview, /role="tab"/);
  assert.match(overview, /tabindex="0"/);
  assert.match(overview, /aria-selected="true"/);
  assert.match(overview, /aria-controls="account-tabs-panel-overview"/);

  const billing = openingTag(html, 'account-tabs-tab-billing');
  assert.match(billing, /role="tab"/);
  assert.match(billing, /disabled=""/);
  assert.match(billing, /aria-disabled="true"/);
  assert.match(billing, /aria-selected="false"/);

  const securityPanel = openingTag(html, 'account-tabs-panel-security');
  assert.match(securityPanel, /role="tabpanel"/);
  assert.match(securityPanel, /hidden=""/);
  assert.match(securityPanel, /aria-labelledby="account-tabs-tab-security"/);
  assert.doesNotMatch(html, /data-vf-selected/);
});

test('Angular Tabs generates unique deterministic relationship ids per application', async () => {
  const firstHtml = await render(GeneratedIdAppComponent, 'vf-tabs-generated-id-ssr-test');
  const secondHtml = await render(GeneratedIdAppComponent, 'vf-tabs-generated-id-ssr-test');

  const idsFor = (html) => [...html.matchAll(/<div[^>]*data-vf-tabs-root[^>]*>/g)]
    .map((match) => attribute(match[0], 'id'));
  const firstIds = idsFor(firstHtml);
  const secondIds = idsFor(secondHtml);

  assert.equal(firstIds.length, 2);
  assert.ok(firstIds.every(Boolean));
  assert.notEqual(firstIds[0], firstIds[1]);
  assert.deepEqual(firstIds, secondIds);

  for (const [rootId, value] of [[firstIds[0], 'first'], [firstIds[1], 'second']]) {
    const tab = openingTag(firstHtml, `${rootId}-tab-${value}`);
    const panel = openingTag(firstHtml, `${rootId}-panel-${value}`);
    assert.match(tab, new RegExp(`aria-controls="${rootId}-panel-${value}"`));
    assert.match(panel, new RegExp(`aria-labelledby="${rootId}-tab-${value}"`));
  }
});
