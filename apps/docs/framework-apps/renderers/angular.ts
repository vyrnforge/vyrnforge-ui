import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  VfAppShellDirective,
  VfAppShellHeaderDirective,
  VfAppShellBodyDirective,
  VfAppShellNavigationDirective,
  VfAppShellMainDirective,
  VfAppShellFooterDirective,
} from '@vyrnforge/angular/app-shell';
import { VfInputDirective } from '@vyrnforge/angular/input';
import {
  VfSideNavDirective,
  VfSideNavGroupDirective,
  VfSideNavGroupLabelDirective,
  VfSideNavListDirective,
  VfSideNavItemDirective,
  VfSideNavLinkDirective,
} from '@vyrnforge/angular/side-nav';
import { markDocsRendered, readDocsPageModel } from '../page-model.js';

const model = readDocsPageModel();

function angularFragment(value: string | undefined): string {
  return (value || '')
    .replaceAll('data-vf-side-nav-group-label', 'vfSideNavGroupLabel')
    .replaceAll('data-vf-side-nav-group', 'vfSideNavGroup')
    .replaceAll('data-vf-side-nav-list', 'vfSideNavList')
    .replaceAll('data-vf-side-nav-item', 'vfSideNavItem')
    .replaceAll('data-vf-side-nav-link', 'vfSideNavLink')
    .replaceAll('data-vf-side-nav', 'vfSideNav')
    .replaceAll('data-vf-current="true"', '[vfSideNavCurrent]="true"')
    .replace(/<input([^>]*data-vf-docs-search[^>]*)>/g, '<input vfInput$1>')
    .replace(/<input([^>]*data-vf-input[^>]*)>/g, '<input vfInput$1>');
}

const template = `
  <div vfAppShell data-vf-docs-renderer="angular">
    <a class="vf-skip-link" href="#main">Skip to content</a>
    <header vfAppShellHeader class="vf-docs-header">${angularFragment(model.headerHtml)}</header>
    <div vfAppShellBody>
      <aside vfAppShellNavigation class="vf-docs-navigation">${angularFragment(model.navigationHtml)}</aside>
      <main vfAppShellMain id="main">${angularFragment(model.mainHtml)}</main>
    </div>
    <footer vfAppShellFooter class="vf-docs-footer">{{ footerText }}</footer>
  </div>
`;

@Component({
  selector: 'vf-docs-angular-root',
  standalone: true,
  imports: [
    VfAppShellDirective,
    VfAppShellHeaderDirective,
    VfAppShellBodyDirective,
    VfAppShellNavigationDirective,
    VfAppShellMainDirective,
    VfAppShellFooterDirective,
    VfInputDirective,
    VfSideNavDirective,
    VfSideNavGroupDirective,
    VfSideNavGroupLabelDirective,
    VfSideNavListDirective,
    VfSideNavItemDirective,
    VfSideNavLinkDirective,
  ],
  template,
})
class DocsApp {
  readonly footerText = model.footerText || '';
}

bootstrapApplication(DocsApp, { providers: [provideZonelessChangeDetection()] }).then(() => {
  markDocsRendered('angular');
});
