import { test } from 'vitest';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import {
  VfAspectRatioDirective,
  VfClusterDirective,
  VfContainerDirective,
  VfControlGroupDirective,
  VfFieldDirective,
  VfFieldsetDirective,
  VfGridDirective,
  VfInlineDirective,
  VfRadioGroupDirective,
  VfStackDirective,
} from '@vyrnforge/angular/layout';

class AppComponent {}
Component({
  selector: 'vf-layout-ssr-test',
  standalone: true,
  imports: [
    VfAspectRatioDirective,
    VfClusterDirective,
    VfContainerDirective,
    VfControlGroupDirective,
    VfFieldDirective,
    VfFieldsetDirective,
    VfGridDirective,
    VfInlineDirective,
    VfRadioGroupDirective,
    VfStackDirective,
  ],
  template: `
    <main id="container" vfContainer vfContainerSize="lg" vfContainerGutter="md">
      <section id="stack" vfStack vfStackGap="lg">
        <section id="grid" vfGrid vfGridGap="md">Cards</section>
        <div id="inline" vfInline vfInlineGap="sm">Inline</div>
        <div id="cluster" vfCluster vfClusterGap="sm">Actions</div>
        <div id="ratio" vfAspectRatio="video"></div>
        <div id="field" vfField vfFieldGap="xs"><label for="email">Email</label><input id="email"></div>
        <fieldset id="fieldset" vfFieldset vfFieldsetGap="sm"><legend>Profile</legend><input name="displayName"></fieldset>
        <div id="control-group" vfControlGroup vfControlGroupOrientation="vertical"><button type="button">Previous</button><button type="button">Next</button></div>
        <fieldset id="radio-group" vfRadioGroup vfRadioGroupGap="sm" vfRadioGroupOrientation="horizontal"><legend>Plan</legend><label><input type="radio" name="plan" value="basic"> Basic</label></fieldset>
      </section>
    </main>
  `,
})(AppComponent);

test('Angular SSR preserves all ten L3 composition contracts on authored native elements', async () => {
  const html = await renderApplication(
    (context) => bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-layout-ssr-test></vf-layout-ssr-test></body></html>' },
  );

  for (const hook of ['container', 'stack', 'grid', 'inline', 'cluster', 'aspect-ratio', 'field', 'fieldset', 'control-group', 'radio-group']) {
    assert.match(html, new RegExp(`data-vf-${hook}`));
  }
  assert.match(html, /<fieldset[^>]*id="fieldset"/);
  assert.match(html, /<fieldset[^>]*id="radio-group"/);
  assert.match(html, /<legend>Profile<\/legend>/);
  assert.match(html, /<legend>Plan<\/legend>/);
  assert.doesNotMatch(html, /id="control-group"[^>]*role=/);
  assert.match(html, /data-vf-control-group-orientation="vertical"/);
  assert.match(html, /data-vf-radio-group-orientation="horizontal"/);
});
