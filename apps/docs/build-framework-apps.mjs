import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { publicPackageAliases } from './example-compiler.mjs';

const sources = Object.freeze({
  react: `
    import { createElement } from 'react';
    import { createRoot } from 'react-dom/client';
    import { flushSync } from 'react-dom';
    import { AppShell, AppShellHeader, AppShellBody, AppShellNavigation, AppShellMain, AppShellFooter } from '@vyrnforge/react/app-shell';

    const model = JSON.parse(document.querySelector('#vf-docs-page-model').textContent || '{}');
    const html = (value) => ({ __html: value || '' });
    const root = createRoot(document.querySelector('#vf-docs-app'));
    flushSync(() => root.render(
      createElement(AppShell, { 'data-vf-docs-renderer': 'react' },
        createElement('a', { className: 'vf-skip-link', href: '#main' }, 'Skip to content'),
        createElement(AppShellHeader, { className: 'vf-docs-header', dangerouslySetInnerHTML: html(model.headerHtml) }),
        createElement(AppShellBody, null,
          createElement(AppShellNavigation, { className: 'vf-docs-navigation', dangerouslySetInnerHTML: html(model.navigationHtml) }),
          createElement(AppShellMain, { id: 'main', dangerouslySetInnerHTML: html(model.mainHtml) })
        ),
        createElement(AppShellFooter, { className: 'vf-docs-footer' }, model.footerText || '')
      )
    ));
    document.documentElement.dataset.vfDocsRendered = 'react';
    document.dispatchEvent(new CustomEvent('vfdocsrendered', { detail: { framework: 'react' } }));
  `,
  angular: `
    import '@angular/compiler';
    import { Component, inject, provideZonelessChangeDetection } from '@angular/core';
    import { bootstrapApplication, DomSanitizer } from '@angular/platform-browser';
    import {
      VfAppShellDirective,
      VfAppShellHeaderDirective,
      VfAppShellBodyDirective,
      VfAppShellNavigationDirective,
      VfAppShellMainDirective,
      VfAppShellFooterDirective
    } from '@vyrnforge/angular/app-shell';

    const model = JSON.parse(document.querySelector('#vf-docs-page-model').textContent || '{}');

    @Component({
      selector: 'vf-docs-angular-root',
      standalone: true,
      imports: [
        VfAppShellDirective,
        VfAppShellHeaderDirective,
        VfAppShellBodyDirective,
        VfAppShellNavigationDirective,
        VfAppShellMainDirective,
        VfAppShellFooterDirective
      ],
      template: \`
        <div vfAppShell data-vf-docs-renderer="angular">
          <a class="vf-skip-link" href="#main">Skip to content</a>
          <header vfAppShellHeader class="vf-docs-header" [innerHTML]="headerHtml"></header>
          <div vfAppShellBody>
            <aside vfAppShellNavigation class="vf-docs-navigation" [innerHTML]="navigationHtml"></aside>
            <main vfAppShellMain id="main" [innerHTML]="mainHtml"></main>
          </div>
          <footer vfAppShellFooter class="vf-docs-footer">{{ footerText }}</footer>
        </div>
      \`
    })
    class DocsApp {
      sanitizer = inject(DomSanitizer);
      headerHtml = this.sanitizer.bypassSecurityTrustHtml(model.headerHtml || '');
      navigationHtml = this.sanitizer.bypassSecurityTrustHtml(model.navigationHtml || '');
      mainHtml = this.sanitizer.bypassSecurityTrustHtml(model.mainHtml || '');
      footerText = model.footerText || '';
    }

    bootstrapApplication(DocsApp, { providers: [provideZonelessChangeDetection()] }).then(() => {
      document.documentElement.dataset.vfDocsRendered = 'angular';
      document.dispatchEvent(new CustomEvent('vfdocsrendered', { detail: { framework: 'angular' } }));
    });
  `,
  vue: `
    import { createApp, h } from 'vue';
    import { AppShell, AppShellHeader, AppShellBody, AppShellNavigation, AppShellMain, AppShellFooter } from '@vyrnforge/vue/app-shell';

    const model = JSON.parse(document.querySelector('#vf-docs-page-model').textContent || '{}');
    const app = createApp({
      render() {
        return h(AppShell, { 'data-vf-docs-renderer': 'vue' }, {
          default: () => [
            h('a', { class: 'vf-skip-link', href: '#main' }, 'Skip to content'),
            h(AppShellHeader, { class: 'vf-docs-header', innerHTML: model.headerHtml || '' }),
            h(AppShellBody, null, {
              default: () => [
                h(AppShellNavigation, { class: 'vf-docs-navigation', innerHTML: model.navigationHtml || '' }),
                h(AppShellMain, { id: 'main', innerHTML: model.mainHtml || '' })
              ]
            }),
            h(AppShellFooter, { class: 'vf-docs-footer' }, { default: () => model.footerText || '' })
          ]
        });
      }
    });
    app.mount('#vf-docs-app');
    document.documentElement.dataset.vfDocsRendered = 'vue';
    document.dispatchEvent(new CustomEvent('vfdocsrendered', { detail: { framework: 'vue' } }));
  `
});

export async function buildFrameworkDocsApps({ root, channelRoot }) {
  const outputRoot = path.join(channelRoot, 'assets/framework-apps');
  await mkdir(outputRoot, { recursive: true });
  const aliases = publicPackageAliases(root);

  for (const [framework, contents] of Object.entries(sources)) {
    await build({
      stdin: {
        resolveDir: root,
        sourcefile: `vyrnforge-docs-${framework}.ts`,
        loader: framework === 'react' ? 'tsx' : 'ts',
        contents
      },
      alias: aliases,
      bundle: true,
      format: 'iife',
      platform: 'browser',
      target: ['es2022'],
      legalComments: 'none',
      tsconfigRaw: {
        compilerOptions: framework === 'angular'
          ? { experimentalDecorators: true, useDefineForClassFields: false }
          : framework === 'react'
            ? { jsx: 'react' }
            : {}
      },
      outfile: path.join(outputRoot, `${framework}.js`)
    });
  }
}
