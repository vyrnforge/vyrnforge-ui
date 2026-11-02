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
import { VfLinkDirective } from '@vyrnforge/angular/link';
import {
  VfSideNavDirective,
  VfSideNavGroupDirective,
  VfSideNavGroupLabelDirective,
  VfSideNavListDirective,
  VfSideNavItemDirective,
  VfSideNavLinkDirective,
} from '@vyrnforge/angular/side-nav';
import { parseFragment } from '../fragment.js';
import { markDocsRendered, readDocsPageModel } from '../page-model.js';

const model = readDocsPageModel();

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
    VfLinkDirective,
    VfSideNavDirective,
    VfSideNavGroupDirective,
    VfSideNavGroupLabelDirective,
    VfSideNavListDirective,
    VfSideNavItemDirective,
    VfSideNavLinkDirective,
  ],
  template: `
    <div vfAppShell data-vf-docs-renderer="angular">
      <a class="vf-skip-link" href="#main">Skip to content</a>
      <header vfAppShellHeader class="vf-docs-header">
        <div class="vf-docs-header__inner">
          <a class="vf-docs-brand" [href]="brandHref">VyrnForge</a>
          <span class="vf-docs-version" data-vf-docs-version>{{ versionText }}</span>
          <div class="vf-docs-tools">
            <div class="vf-docs-search-wrap">
              <label for="vf-docs-search">Search</label>
              <input vfInput id="vf-docs-search" data-vf-docs-search type="search" autocomplete="off">
              <ul class="vf-docs-search-results" data-vf-docs-search-results hidden></ul>
            </div>
            <nav class="vf-docs-framework-switcher" aria-label="Framework">
              <ul class="vf-docs-framework-switcher__list">
                @for (choice of frameworkChoices; track choice.id) {
                  <li>
                    <a
                      vfLink
                      class="vf-docs-framework-switcher__link"
                      [href]="choice.href"
                      [attr.data-vf-framework-choice]="choice.id"
                      [attr.data-vf-framework-current]="choice.current ? 'true' : null"
                      [attr.aria-current]="choice.current ? 'page' : null"
                      [attr.aria-label]="choice.label + ' documentation'"
                      [attr.title]="choice.label"
                    >
                      @if (choice.mark) {
                        <svg
                          class="vf-framework-mark"
                          [attr.data-vf-framework-mark]="choice.id"
                          [attr.viewBox]="choice.mark.viewBox"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path [attr.d]="choice.mark.path"></path>
                        </svg>
                      }
                    </a>
                  </li>
                }
              </ul>
            </nav>
          </div>
        </div>
      </header>
      <div vfAppShellBody>
        <aside vfAppShellNavigation class="vf-docs-navigation">
          <nav vfSideNav aria-label="Documentation">
            @for (group of navigation; track group.label) {
              <section vfSideNavGroup>
                <h2 vfSideNavGroupLabel>{{ group.label }}</h2>
                @if (group.subgroups.length) {
                  @for (subgroup of group.subgroups; track subgroup.label) {
                    <details
                      class="vf-docs-component-subgroup"
                      data-vf-docs-component-subgroup
                      [attr.data-vf-current-group]="subgroup.open ? 'true' : null"
                      [open]="subgroup.open"
                    >
                      <summary class="vf-docs-component-subgroup__label">
                        <span>{{ subgroup.label }}</span>
                        <span class="vf-docs-component-subgroup__count" aria-hidden="true">{{ subgroup.count }}</span>
                      </summary>
                      <ul vfSideNavList>
                        @for (item of subgroup.items; track item.href) {
                          <li vfSideNavItem>
                            <a vfSideNavLink [href]="item.href" [vfSideNavCurrent]="item.current">{{ item.title }}</a>
                          </li>
                        }
                      </ul>
                    </details>
                  }
                } @else {
                  <ul vfSideNavList>
                    @for (item of group.items; track item.href) {
                      <li vfSideNavItem>
                        <a vfSideNavLink [href]="item.href" [vfSideNavCurrent]="item.current">{{ item.title }}</a>
                      </li>
                    }
                  </ul>
                }
              </section>
            }
          </nav>
        </aside>
        <main vfAppShellMain id="main"></main>
      </div>
      <footer vfAppShellFooter class="vf-docs-footer">{{ footerText }}</footer>
    </div>
  `,
})
class DocsApp {
  readonly brandHref = model.brandHref || './';
  readonly versionText = model.versionText || '';
  readonly frameworkChoices = model.frameworkChoices || [];
  readonly navigation = model.navigation || [];
  readonly footerText = model.footerText || '';
}

bootstrapApplication(DocsApp, { providers: [provideZonelessChangeDetection()] }).then(() => {
  const main = document.querySelector('[data-vf-app-shell-main]');
  if (!main) throw new Error('Angular docs AppShell main region did not render');
  main.replaceChildren(...parseFragment(model.mainHtml));
  markDocsRendered('angular');
});
