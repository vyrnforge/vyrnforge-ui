import { test } from 'vitest';
import assert from 'node:assert/strict';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { VfSideNavLinkDirective } from '@vyrnforge/angular/side-nav';

const values = ['step', 'page', 'location', 'false', 'date', 'time', 'true', null];
const overrides = ['omitted', 'false', 'true'];

for (const authored of values) {
  for (const override of overrides) {
    for (const kind of ['static', 'bound']) {
      test(`Angular SideNav SSR: ${kind} ${authored} / convenience ${override}`, async () => {
        const attribute = kind === 'bound'
          ? '[aria-current]="authored"'
          : authored === null ? '' : `aria-current="${authored}"`;
        const convenience = override === 'omitted' ? '' : `[vfSideNavCurrent]="${override}"`;
        class App { authored = authored; }
        Component({
          selector: 'vf-side-nav-current-ssr',
          standalone: true,
          imports: [VfSideNavLinkDirective],
          template: `<a vfSideNavLink href="/destination" ${attribute} ${convenience}>Destination</a>`,
        })(App);
        const html = await renderApplication(
          (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
          { document: '<!doctype html><html><body><vf-side-nav-current-ssr></vf-side-nav-current-ssr></body></html>' },
        );
        const anchor = html.match(/<a\b[^>]*>/)?.[0];
        assert.ok(anchor, 'native anchor rendered');
        assert.match(anchor, /href="\/destination"/);
        assert.match(anchor, /data-vf-side-nav-link/);
        const expected = override === 'true' ? 'page' : authored;
        const actual = anchor.match(/\baria-current="([^"]*)"/)?.[1] ?? null;
        assert.equal(actual, expected);
        if (expected !== 'page') assert.doesNotMatch(anchor, /data-vf-current="true"/);
      });
    }
  }
}

test('native Web hook in Angular leaves explicit attribute binding consumer-owned', async () => {
  class App { authored = 'location'; }
  Component({
    selector: 'vf-side-nav-native-ssr',
    standalone: true,
    template: '<a data-vf-side-nav-link [attr.aria-current]="authored" href="/destination">Destination</a>',
  })(App);
  const html = await renderApplication(
    context => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html><body><vf-side-nav-native-ssr></vf-side-nav-native-ssr></body></html>' },
  );
  assert.match(html, /<a\b[^>]*aria-current="location"/);
});
