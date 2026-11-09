import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const stripFoundationImports = (css) => css
  .replace('@import "../../styles/tokens.css";\n', '')
  .replace('@import "../../styles/internal/typography-roles.css";\n', '')
  .replace('@import "./tokens.css";\n', '')
  .replace('@import "./internal/typography-roles.css";\n', '');

export const browserFixture = {
  component: 'text',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/text');
    await mkdir(outDir, { recursive: true });

    const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const textCss = stripFoundationImports(await readFile(path.join(root, 'packages/web/dist/components/text/text.css'), 'utf8'));
    const typographyRolesCss = stripFoundationImports(await readFile(path.join(root, 'packages/web/dist/styles/internal/typography-roles.css'), 'utf8'));
    const nativeElementsCss = stripFoundationImports(await readFile(path.join(root, 'packages/web/dist/styles/native-elements.css'), 'utf8'));
    const compositionComponents = port === 'web'
      ? ['button', 'link', 'code', 'kbd']
      : port === 'react'
        ? ['button', 'link']
        : [];
    const compositionCss = await Promise.all(compositionComponents.map(async (component) =>
      stripFoundationImports(await readFile(path.join(root, `packages/web/dist/components/${component}/${component}.css`), 'utf8'))
    ));
    const customCss = '[data-vf-text][data-vf-text-variant="poster"] { font-size: 2.625rem; font-weight: 700; }';

    // Component CSS intentionally appears before Text CSS here. The canonical
    // layer order must keep component presentation above the typography foundation
    // regardless of stylesheet import order.
    await writeFile(path.join(outDir, 'text.css'), `${tokensCss}\n${typographyRolesCss}\n${nativeElementsCss}\n${compositionCss.join('\n')}\n${textCss}\n${customCss}`);

    const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./text.css"><title>Text fixture</title></head><body><main><h1>Text fixture</h1>${body}</main></body></html>`;

    if (port === 'web') {
      await writeFile(path.join(outDir, 'web.html'), page(`
        <h2 id="heading" data-vf-text data-vf-text-variant="heading-md">Typography</h2>
        <p id="body" data-vf-text data-vf-text-variant="body-md">Readable body copy</p>
        <span id="label" data-vf-text data-vf-text-variant="label-md">Account name</span>
        <p id="poster" data-vf-text data-vf-text-variant="poster">Custom poster</p>

        <section aria-label="Native typography composition">
          <h1 id="semantic-heading" data-vf-text data-vf-text-variant="body-sm">Semantic heading with a body-sized visual treatment</h1>
          <a id="composed-link" data-vf-link data-vf-text data-vf-text-variant="body-sm" href="#target">Composed link</a>
          <button id="composed-button" data-vf-button data-vf-variant="primary" data-vf-size="md" data-vf-text data-vf-text-variant="label-sm" type="button">Composed button</button>
          <code id="default-code" data-vf-code>default code</code>
          <code id="composed-code" data-vf-code data-vf-text data-vf-text-variant="body-lg">composed code</code>
          <kbd id="default-kbd" data-vf-kbd>Ctrl</kbd>
          <kbd id="composed-kbd" data-vf-kbd data-vf-text data-vf-text-variant="body-sm">Shift</kbd>
          <mark id="composed-mark" data-vf-text data-vf-text-variant="heading-xs">Highlighted text</mark>
          <span id="target">Target</span>
        </section>

        <article data-vf-prose>
          <h1 id="prose-heading">Native prose heading</h1>
          <h2 id="prose-explicit" data-vf-text data-vf-text-variant="body-sm">Native h2 with explicit Text treatment</h2>
          <p>Native paragraph remains ordinary prose rather than a Paragraph component.</p>
        </article>
      `));
    }

    if (port === 'react') {
      const { createElement } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { Text } = await import('@vyrnforge/react/text');
      const { Link } = await import('@vyrnforge/react/link');
      const { Button } = await import('@vyrnforge/react/button');
      const markup = renderToString(createElement('div', null,
        createElement(Text, { id: 'heading', as: 'h2', variant: 'heading-md' }, 'Typography'),
        createElement(Text, { id: 'body', as: 'p', variant: 'body-md' }, 'Readable body copy'),
        createElement(Text, { id: 'label', variant: 'label-md' }, 'Account name'),
        createElement(Text, { id: 'poster', as: 'p', variant: 'poster' }, 'Custom poster'),
        createElement(Text, { id: 'quote', as: 'blockquote', variant: 'body-lg', cite: 'https://example.com/source' }, 'Quotation'),
        createElement(Text, { id: 'mark', as: 'mark', variant: 'body-md' }, 'Highlighted'),
        createElement(Text, { id: 'time', as: 'time', variant: 'caption', dateTime: '2026-11-10' }, 'November 10, 2026'),
        createElement('section', { 'aria-label': 'React typography composition' },
          createElement(Link, { id: 'react-composed-link', href: '#react-target', textVariant: 'body-sm' }, 'React composed link'),
          createElement(Link, { id: 'react-default-link', href: '#react-target' }, 'React default link'),
          createElement(Button, { id: 'react-composed-button', type: 'button', textVariant: 'label-sm' }, 'React composed button'),
          createElement(Button, { id: 'react-default-button', type: 'button' }, 'React default button'),
          createElement('span', { id: 'react-target' }, 'React target')
        )
      ));
      await writeFile(path.join(outDir, 'react.html'), page(markup));
    }

    if (port === 'vue') {
      const { createSSRApp, h } = await import('vue');
      const { renderToString } = await import('@vue/server-renderer');
      const { Text } = await import('@vyrnforge/vue/text');
      const markup = await renderToString(createSSRApp({
        render: () => h('div', null, [
          h(Text, { id: 'heading', as: 'h2', variant: 'heading-md' }, () => 'Typography'),
          h(Text, { id: 'body', as: 'p', variant: 'body-md' }, () => 'Readable body copy'),
          h(Text, { id: 'label', variant: 'label-md' }, () => 'Account name'),
          h(Text, { id: 'poster', as: 'p', variant: 'poster' }, () => 'Custom poster'),
          h(Text, { id: 'quote', as: 'blockquote', variant: 'body-lg', cite: 'https://example.com/source' }, () => 'Quotation'),
          h(Text, { id: 'mark', as: 'mark', variant: 'body-md' }, () => 'Highlighted'),
          h(Text, { id: 'time', as: 'time', variant: 'caption', datetime: '2026-11-10' }, () => 'November 10, 2026')
        ])
      }));
      await writeFile(path.join(outDir, 'vue.html'), page(markup));
    }

    if (port === 'angular') {
      await import('@angular/compiler');
      const { Component, provideZonelessChangeDetection } = await import('@angular/core');
      const { bootstrapApplication } = await import('@angular/platform-browser');
      const { renderApplication } = await import('@angular/platform-server');
      const { VfTextDirective } = await import('@vyrnforge/angular/text');
      class App {}
      Component({
        selector: 'vf-text-test',
        standalone: true,
        imports: [VfTextDirective],
        template: '<main><h1>Text fixture</h1><h2 id="heading" vfText variant="heading-md">Typography</h2><p id="body" vfText variant="body-md">Readable body copy</p><span id="label" vfText variant="label-md">Account name</span><p id="poster" vfText variant="poster">Custom poster</p><blockquote id="quote" vfText variant="body-lg" cite="https://example.com/source">Quotation</blockquote><mark id="mark" vfText variant="body-md">Highlighted</mark><time id="time" vfText variant="caption" datetime="2026-11-10">November 10, 2026</time></main>'
      })(App);
      const html = await renderApplication(
        (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
        { document: '<!doctype html><html lang="en"><head><title>Text fixture</title><link rel="stylesheet" href="./text.css"></head><body><vf-text-test></vf-text-test></body></html>' }
      );
      await writeFile(path.join(outDir, 'angular.html'), html);
    }
  },
};
