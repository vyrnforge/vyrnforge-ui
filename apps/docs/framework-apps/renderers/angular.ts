import '@angular/compiler';
import { Component, input, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  VfAppShellDirective,
  VfAppShellHeaderDirective,
  VfAppShellBodyDirective,
  VfAppShellNavigationDirective,
  VfAppShellMainDirective,
  VfAppShellFooterDirective,
} from '@vyrnforge/angular/app-shell';
import { VfButtonDirective } from '@vyrnforge/angular/button';
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
import { VfSurfaceDirective } from '@vyrnforge/angular/surface';
import { VfTextDirective } from '@vyrnforge/angular/text';
import { VfTextareaDirective } from '@vyrnforge/angular/textarea';
import { parseInline } from '../../content-model.mjs';
import { parseFragment } from '../fragment.js';
import { markDocsRendered, readDocsPageModel } from '../page-model.js';

const model = readDocsPageModel();

@Component({
  selector: 'vf-docs-rich-text',
  standalone: true,
  imports: [VfTextDirective],
  template: `
    @for (part of parts(); track $index) {
      @switch (part.kind) {
        @case ('code') { <code>{{ part.value }}</code> }
        @case ('strong') { <strong vfText variant="label-md">{{ part.value }}</strong> }
        @default { {{ part.value }} }
      }
    }
  `,
})
class DocsRichText {
  readonly value = input('');
  parts() {
    return parseInline(this.value());
  }
}

@Component({
  selector: 'vf-docs-angular-root',
  standalone: true,
  imports: [
    DocsRichText,
    VfAppShellDirective,
    VfAppShellHeaderDirective,
    VfAppShellBodyDirective,
    VfAppShellNavigationDirective,
    VfAppShellMainDirective,
    VfAppShellFooterDirective,
    VfButtonDirective,
    VfInputDirective,
    VfLinkDirective,
    VfSideNavDirective,
    VfSideNavGroupDirective,
    VfSideNavGroupLabelDirective,
    VfSideNavListDirective,
    VfSideNavItemDirective,
    VfSideNavLinkDirective,
    VfSurfaceDirective,
    VfTextDirective,
    VfTextareaDirective,
  ],
  template: `
    <div vfAppShell data-vf-docs-renderer="angular">
      <a vfLink class="vf-skip-link" href="#main">Skip to content</a>
      <header vfAppShellHeader class="vf-docs-header">
        <div class="vf-docs-header__inner">
          <a vfLink class="vf-docs-brand" [href]="brandHref">VyrnForge</a>
          <span vfText variant="label-md" class="vf-docs-version" data-vf-docs-version>{{ versionText }}</span>
          <div class="vf-docs-tools">
            <div class="vf-docs-search-wrap">
              <label vfText variant="label-md" for="vf-docs-search">Search</label>
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
        <main vfAppShellMain id="main">
          @if (mainContent) {
            <h1 vfText variant="heading-lg">{{ mainContent.pageTitle }}</h1>
            @if (mainContent.context; as context) {
              <div class="vf-docs-framework-context" [attr.data-vf-framework-context]="context.framework">
                <strong vfText variant="label-md">
                  @if (context.mark) {
                    <svg class="vf-framework-mark" [attr.data-vf-framework-mark]="context.framework" [attr.viewBox]="context.mark.viewBox" aria-hidden="true" focusable="false">
                      <path [attr.d]="context.mark.path"></path>
                    </svg>
                  }
                  <span>{{ context.label }}</span>
                </strong>
                <span>
                  @if (context.entrypoint) { Public entrypoint: <code>{{ context.entrypoint }}</code> }
                  @else { Framework-specific documentation view }
                </span>
              </div>
            }
            <p vfText variant="body-lg" class="vf-docs-lede"><vf-docs-rich-text [value]="mainContent.lede" /></p>
            @if (mainContent.meta?.length) {
              <div class="vf-docs-page-meta" [attr.aria-label]="mainContent.pageTitle + ' characteristics'">
                @for (item of mainContent.meta; track item) { <span vfText variant="label-md">{{ item }}</span> }
              </div>
            }
            @for (section of mainContent.sections; track section.title) {
              <section [attr.data-vf-framework-adaptation]="section.adaptation || null">
                <h2 vfText variant="heading-md">{{ section.title }}</h2>
                @for (block of section.blocks; track $index) {
                  @switch (block.type) {
                    @case ('paragraph') {
                      <p vfText variant="body-md"><vf-docs-rich-text [value]="block.text" /></p>
                    }
                    @case ('heading') {
                      <h3 vfText variant="heading-sm"><vf-docs-rich-text [value]="block.text" /></h3>
                    }
                    @case ('code') {
                      <pre tabindex="0" [attr.data-vf-framework-usage-code]="block.frameworkUsage ? mainContent.framework : null"><code [class]="'language-' + (block.language || 'text')">{{ block.value || '' }}</code></pre>
                    }
                    @case ('split') {
                      <div class="vf-docs-split">
                        @for (item of block.items; track item.title) {
                          <article vfSurface [class]="'vf-docs-card vf-docs-card--' + (item.tone || 'neutral')">
                            <h3 vfText variant="heading-sm">{{ item.title }}</h3>
                            <p vfText variant="body-md"><vf-docs-rich-text [value]="item.text" /></p>
                          </article>
                        }
                      </div>
                    }
                    @case ('example-unavailable') {
                      <section vfSurface class="vf-example--unavailable" [attr.data-vf-example-unavailable]="block.id">
                        <h3 vfText variant="heading-sm">{{ block.title }}</h3>
                        <p vfText variant="body-md">This executable example is not available for the selected framework in this documentation channel.</p>
                      </section>
                    }
                    @case ('example') {
                      <section
                        vfSurface
                        class="vf-example"
                        [attr.data-vf-example-id]="block.id"
                        [attr.data-vf-example-default-framework]="block.framework"
                        [attr.data-vf-example-locked-framework]="block.framework"
                      >
                        <header class="vf-example__header">
                          <div>
                            <h3 vfText variant="heading-sm">{{ block.title }}</h3>
                            @if (block.description) { <p vfText variant="body-md">{{ block.description }}</p> }
                          </div>
                          <span vfText variant="label-md" class="vf-example__framework">{{ block.framework }}</span>
                        </header>
                        <div class="vf-example__preview"><iframe data-vf-example-frame [attr.title]="block.title + ' preview'" sandbox="allow-scripts"></iframe></div>
                        <div class="vf-example__controls"><button vfButton variant="ghost" size="sm" type="button" data-vf-example-code-toggle aria-expanded="false">Show code</button></div>
                        <div class="vf-example__editor" data-vf-example-editor hidden>
                          <div class="vf-example__editor-toolbar">
                            <strong vfText variant="label-md">Editable source</strong>
                            <span data-vf-example-language></span>
                            <span class="vf-example__editor-actions">
                              <button vfButton variant="primary" size="sm" type="button" data-vf-example-run>Run</button>
                              <button vfButton variant="secondary" size="sm" type="button" data-vf-example-reset>Reset</button>
                            </span>
                          </div>
                          <textarea vfTextarea data-vf-example-source spellcheck="false" [attr.aria-label]="block.title + ' code editor'"></textarea>
                          <p vfText variant="body-sm" class="vf-example__status" data-vf-example-status aria-live="polite">Ready.</p>
                        </div>
                        <span data-vf-example-data hidden>{{ exampleData(block) }}</span>
                      </section>
                    }
                    @case ('list') {
                      <ul>@for (item of block.items; track $index) { <li><vf-docs-rich-text [value]="item" /></li> }</ul>
                    }
                    @case ('note') {
                      <aside vfSurface class="vf-docs-note"><vf-docs-rich-text [value]="block.text" /></aside>
                    }
                    @case ('table') {
                      <div vfSurface class="vf-docs-table-wrap" tabindex="0" role="region" [attr.aria-label]="block.label || 'Reference table'">
                        <table>
                          <thead><tr>@for (column of block.columns; track $index) { <th><vf-docs-rich-text [value]="column" /></th> }</tr></thead>
                          <tbody>
                            @for (row of block.rows; track $index) {
                              <tr>
                                @for (cell of row; track $index) {
                                  @if ($index === 0) { <th scope="row"><vf-docs-rich-text [value]="cell" /></th> }
                                  @else { <td><vf-docs-rich-text [value]="cell" /></td> }
                                }
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    }
                  }
                }
              </section>
            }
          }
        </main>
      </div>
      <footer vfAppShellFooter class="vf-docs-footer"><span vfText variant="body-sm">{{ footerText }}</span></footer>
    </div>
  `,
})
class DocsApp {
  readonly brandHref = model.brandHref || './';
  readonly versionText = model.versionText || '';
  readonly frameworkChoices = model.frameworkChoices || [];
  readonly navigation = model.navigation || [];
  readonly footerText = model.footerText || '';
  readonly mainContent = model.mainContent || null;

  exampleData(block: { data: unknown }) {
    return JSON.stringify(block.data).replaceAll('<', '\\u003c');
  }
}

bootstrapApplication(DocsApp, { providers: [provideZonelessChangeDetection()] }).then(() => {
  if (!model.mainContent) {
    const main = document.querySelector('[data-vf-app-shell-main]');
    if (!main) throw new Error('Angular docs AppShell main region did not render');
    main.replaceChildren(...parseFragment(model.mainHtml || ''));
  }
  markDocsRendered('angular');
});
