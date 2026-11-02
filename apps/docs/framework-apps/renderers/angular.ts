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
import { VfNativeSelectDirective } from '@vyrnforge/angular/native-select';
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

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function navItemsTemplate(items: Array<{ title: string; href: string; current: boolean }>): string {
  return items
    .map((item) => `<li vfSideNavItem><a vfSideNavLink href="${escapeHtml(item.href)}"${item.current ? ' [vfSideNavCurrent]="true"' : ''}>${escapeHtml(item.title)}</a></li>`)
    .join('');
}

function navigationTemplate(): string {
  const groups = model.navigation.map((group: { label: string; items: Array<{ title: string; href: string; current: boolean }>; subgroups: Array<{ label: string; count: number; open: boolean; items: Array<{ title: string; href: string; current: boolean }> }> }) => {
    const body = group.subgroups.length
      ? group.subgroups.map((subgroup) => `<details class="vf-docs-component-subgroup" data-vf-docs-component-subgroup${subgroup.open ? ' data-vf-current-group="true" open' : ''}><summary class="vf-docs-component-subgroup__label"><span>${escapeHtml(subgroup.label)}</span><span class="vf-docs-component-subgroup__count" aria-hidden="true">${subgroup.count}</span></summary><ul vfSideNavList>${navItemsTemplate(subgroup.items)}</ul></details>`).join('')
      : `<ul vfSideNavList>${navItemsTemplate(group.items)}</ul>`;
    return `<section vfSideNavGroup><h2 vfSideNavGroupLabel>${escapeHtml(group.label)}</h2>${body}</section>`;
  }).join('');
  return `<nav vfSideNav aria-label="Documentation">${groups}</nav>`;
}

function frameworkSelectorTemplate(): string {
  const options = model.frameworkChoices
    .map((choice: { id: string; label: string; href: string; current: boolean }) => `<option value="${escapeHtml(choice.href)}" data-vf-framework-value="${escapeHtml(choice.id)}"${choice.current ? ' selected' : ''}>${escapeHtml(choice.label)}</option>`)
    .join('');
  return `<div class="vf-docs-framework-selector"><label for="vf-docs-framework-select">Framework</label><select vfNativeSelect id="vf-docs-framework-select" data-vf-framework-select aria-label="Framework">${options}</select></div>`;
}

const template = `
  <div vfAppShell data-vf-docs-renderer="angular">
    <a class="vf-skip-link" href="#main">Skip to content</a>
    <header vfAppShellHeader class="vf-docs-header">
      <div class="vf-docs-header__inner">
        <a class="vf-docs-brand" href="${escapeHtml(model.brandHref)}">VyrnForge</a>
        <span class="vf-docs-version" data-vf-docs-version>${escapeHtml(model.versionText)}</span>
        <div class="vf-docs-tools">
          <div class="vf-docs-search-wrap">
            <label for="vf-docs-search">Search</label>
            <input vfInput id="vf-docs-search" data-vf-docs-search type="search" autocomplete="off">
            <ul class="vf-docs-search-results" data-vf-docs-search-results hidden></ul>
          </div>
          ${frameworkSelectorTemplate()}
        </div>
      </div>
    </header>
    <div vfAppShellBody>
      <aside vfAppShellNavigation class="vf-docs-navigation">${navigationTemplate()}</aside>
      <main vfAppShellMain id="main">${model.mainHtml || ''}</main>
    </div>
    <footer vfAppShellFooter class="vf-docs-footer">${escapeHtml(model.footerText || '')}</footer>
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
    VfNativeSelectDirective,
    VfSideNavDirective,
    VfSideNavGroupDirective,
    VfSideNavGroupLabelDirective,
    VfSideNavListDirective,
    VfSideNavItemDirective,
    VfSideNavLinkDirective,
  ],
  template,
})
class DocsApp {}

bootstrapApplication(DocsApp, { providers: [provideZonelessChangeDetection()] }).then(() => {
  markDocsRendered('angular');
});
