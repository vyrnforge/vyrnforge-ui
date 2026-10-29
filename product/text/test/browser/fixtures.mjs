import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'text',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/text');
    await mkdir(outDir, { recursive: true });

    const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const textCss = (await readFile(path.join(root, 'packages/web/dist/components/text/text.css'), 'utf8'))
      .replace('@import "../../styles/tokens.css";\n', '');
    const customCss = '[data-vf-text][data-vf-text-variant="poster"] { font-size: 2.625rem; font-weight: 700; }';
    await writeFile(path.join(outDir, 'text.css'), `${tokensCss}\n${textCss}\n${customCss}`);

    const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./text.css"><title>Text fixture</title></head><body><main><h1>Text fixture</h1>${body}</main></body></html>`;

    if (port === 'web') {
      await writeFile(path.join(outDir, 'web.html'), page('<h2 id="heading" data-vf-text data-vf-text-variant="heading-md">Typography</h2><p id="body" data-vf-text data-vf-text-variant="body-md">Readable body copy</p><span id="label" data-vf-text data-vf-text-variant="label-md">Account name</span><p id="poster" data-vf-text data-vf-text-variant="poster">Custom poster</p>'));
    }

    if (port === 'react') {
      const { createElement } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { Text } = await import('@vyrnforge/react/text');
      const markup = renderToString(createElement('div', null,
        createElement(Text, { id: 'heading', as: 'h2', variant: 'heading-md' }, 'Typography'),
        createElement(Text, { id: 'body', as: 'p', variant: 'body-md' }, 'Readable body copy'),
        createElement(Text, { id: 'label', variant: 'label-md' }, 'Account name'),
        createElement(Text, { id: 'poster', as: 'p', variant: 'poster' }, 'Custom poster')
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
          h(Text, { id: 'poster', as: 'p', variant: 'poster' }, () => 'Custom poster')
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
        template: '<main><h1>Text fixture</h1><h2 id="heading" vfText variant="heading-md">Typography</h2><p id="body" vfText variant="body-md">Readable body copy</p><span id="label" vfText variant="label-md">Account name</span><p id="poster" vfText variant="poster">Custom poster</p></main>'
      })(App);
      const html = await renderApplication(
        (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
        { document: '<!doctype html><html lang="en"><head><title>Text fixture</title><link rel="stylesheet" href="./text.css"></head><body><vf-text-test></vf-text-test></body></html>' }
      );
      await writeFile(path.join(outDir, 'angular.html'), html);
    }
  },
};
