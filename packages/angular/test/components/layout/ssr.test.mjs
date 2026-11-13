import { test } from 'vitest';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import {
  VfAutoGridDirective,
  VfClusterDirective,
  VfContainerDirective,
  VfControlGroupDirective,
  VfInlineDirective,
  VfStackDirective,
} from '@vyrnforge/angular/layout';

class AppComponent {}
Component({
  selector: 'vf-layout-ssr-test',
  standalone: true,
  imports: [VfAutoGridDirective, VfClusterDirective, VfContainerDirective, VfControlGroupDirective, VfInlineDirective, VfStackDirective],
  template: `
    <main id="container" vfContainer vfContainerSize="lg" vfContainerGutter="md">
      <section id="stack" vfStack vfStackGap="lg">
        <section id="auto-grid" vfAutoGrid vfAutoGridGap="md">Cards</section>
        <div id="inline" vfInline vfInlineGap="sm">Inline</div>
        <div id="cluster" vfCluster vfClusterGap="sm">Actions</div>
        <div id="control-group" vfControlGroup vfControlGroupOrientation="vertical"><button type="button">Previous</button><button type="button">Next</button></div>
      </section>
    </main>
  `,
})(AppComponent);

test('Angular SSR preserves the six L3 composition contracts on authored native elements', async () => {
  const html = await renderApplication(
    (context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-layout-ssr-test></vf-layout-ssr-test></body></html>' },
  );

  for (const hook of ['container', 'stack', 'auto-grid', 'inline', 'cluster', 'control-group']) {
    assert.match(html, new RegExp(`data-vf-${hook}`));
  }
  for (const retired of ['grid', 'aspect-ratio', 'field', 'fieldset', 'radio-group']) {
    assert.doesNotMatch(html, new RegExp(`data-vf-${retired}(?:\\s|=)`));
  }
  assert.doesNotMatch(html, /id="control-group"[^>]*role=/);
  assert.match(html, /data-vf-control-group-orientation="vertical"/);
});
