import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const port = process.argv[2] || 'web';
const root = process.cwd();
const outDir = path.join(root, 'dist/docs/next/text-fixtures');
await mkdir(outDir, { recursive: true });
const css = await readFile(path.join(root, 'packages/web/dist/components/text/text.css'), 'utf8');
await writeFile(path.join(outDir, 'text.css'), css);

const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./text.css"><title>Text fixture</title></head><body><main><h1>Text fixture</h1>${body}</main></body></html>`;

if (port === 'web') {
  await writeFile(path.join(outDir, 'web.html'), page('<h2 id="heading" data-vf-text data-vf-text-variant="heading">Typography</h2><p id="body" data-vf-text data-vf-text-variant="body">Readable body copy</p><span id="label" data-vf-text data-vf-text-variant="label">Account name</span>'));
}

if (port === 'react') {
  const { createElement } = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { Text } = await import('@vyrnforge/react/text');
  const markup = renderToString(createElement('div', null,
    createElement(Text, { id: 'heading', as: 'h2', variant: 'heading' }, 'Typography'),
    createElement(Text, { id: 'body', as: 'p' }, 'Readable body copy'),
    createElement(Text, { id: 'label', variant: 'label' }, 'Account name')
  ));
  await writeFile(path.join(outDir, 'react.html'), page(markup));
}

if (port === 'vue') {
  const { createSSRApp, h } = await import('vue');
  const { renderToString } = await import('@vue/server-renderer');
  const { Text } = await import('@vyrnforge/vue/text');
  const markup = await renderToString(createSSRApp({
    render: () => h('div', null, [
      h(Text, { id: 'heading', as: 'h2', variant: 'heading' }, () => 'Typography'),
      h(Text, { id: 'body', as: 'p' }, () => 'Readable body copy'),
      h(Text, { id: 'label', variant: 'label' }, () => 'Account name')
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
    template: '<main><h1>Text fixture</h1><h2 id="heading" vfText variant="heading">Typography</h2><p id="body" vfText>Readable body copy</p><span id="label" vfText variant="label">Account name</span></main>'
  })(App);
  const html = await renderApplication(
    (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!doctype html><html lang="en"><head><title>Text fixture</title><link rel="stylesheet" href="./text.css"></head><body><vf-text-test></vf-text-test></body></html>' }
  );
  await writeFile(path.join(outDir, 'angular.html'), html);
}
