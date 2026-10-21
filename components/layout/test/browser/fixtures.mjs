import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2] || 'web';
const root = process.cwd();
const outDir = path.join(root, 'dist/docs/next/layout-fixtures');
await mkdir(outDir, { recursive: true });

const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
const layoutCss = (await readFile(path.join(root, 'packages/web/dist/components/layout/layout.css'), 'utf8')).replace('@import "../../styles/tokens.css";\n', '');
const fixtureCss = 'html { font-size: 16px; } body { margin: 0; } #actions { inline-size: 13rem; } button { min-inline-size: 6rem; }';
await writeFile(path.join(outDir, 'layout.css'), `${tokensCss}\n${layoutCss}\n${fixtureCss}`);

const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./layout.css"><title>Layout fixture</title></head><body>${body}${script}</body></html>`;
const webMarkup = '<main id="container" data-vf-container data-vf-container-size="sm" data-vf-container-gutter="md"><section id="stack" data-vf-stack data-vf-stack-gap="lg" data-vf-stack-align="start" data-vf-stack-justify="start" aria-labelledby="heading"><h1 id="heading">Layout fixture</h1><div id="actions" dir="rtl" data-vf-cluster data-vf-cluster-gap="sm" data-vf-cluster-align="center" data-vf-cluster-justify="space-between"><button id="first" type="button">First</button><button id="second" type="button">Second</button><button id="third" type="button">Third</button></div></section></main>';
if (port === 'web') await writeFile(path.join(outDir, 'web.html'), page(webMarkup));

if (port === 'react') {
  const { createElement } = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { Cluster, Container, Stack } = await import('@vyrnforge/react/layout');
  const markup = renderToString(createElement(Container, { as: 'main', id: 'container', size: 'sm', gutter: 'md' }, createElement(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start', 'aria-labelledby': 'heading' }, createElement('h1', { id: 'heading' }, 'Layout fixture'), createElement(Cluster, { id: 'actions', gap: 'sm', align: 'center', justify: 'space-between', dir: 'rtl' }, createElement('button', { id: 'first', type: 'button' }, 'First'), createElement('button', { id: 'second', type: 'button' }, 'Second'), createElement('button', { id: 'third', type: 'button' }, 'Third')))));
  await writeFile(path.join(outDir, 'react.html'), page(markup));
}

if (port === 'vue') {
  const { createSSRApp, h } = await import('vue');
  const { renderToString } = await import('@vue/server-renderer');
  const { Cluster, Container, Stack } = await import('@vyrnforge/vue/layout');
  const app = createSSRApp({
    render: () => h(
      Container,
      { as: 'main', id: 'container', size: 'sm', gutter: 'md' },
      () => h(
        Stack,
        { as: 'section', id: 'stack', gap: 'lg', align: 'start', 'aria-labelledby': 'heading' },
        () => [
          h('h1', { id: 'heading' }, 'Layout fixture'),
          h(
            Cluster,
            { id: 'actions', gap: 'sm', align: 'center', justify: 'space-between', dir: 'rtl' },
            () => [
              h('button', { id: 'first', type: 'button' }, 'First'),
              h('button', { id: 'second', type: 'button' }, 'Second'),
              h('button', { id: 'third', type: 'button' }, 'Third'),
            ]
          ),
        ]
      )
    ),
  });
  const markup = await renderToString(app);
  await writeFile(path.join(outDir, 'vue.html'), page(markup));
}

if (port === 'angular') {
  await import('@angular/compiler');
  const { Component, provideZonelessChangeDetection } = await import('@angular/core');
  const { bootstrapApplication } = await import('@angular/platform-browser');
  const { renderApplication } = await import('@angular/platform-server');
  const { VfClusterDirective, VfContainerDirective, VfStackDirective } = await import('@vyrnforge/angular/layout');
  class App {}
  Component({ selector: 'vf-layout-test', standalone: true, imports: [VfClusterDirective, VfContainerDirective, VfStackDirective], template: '<main id="container" vfContainer vfContainerSize="sm" vfContainerGutter="md"><section id="stack" vfStack vfStackGap="lg" vfStackAlign="start" aria-labelledby="heading"><h1 id="heading">Layout fixture</h1><div id="actions" dir="rtl" vfCluster vfClusterGap="sm" vfClusterAlign="center" vfClusterJustify="space-between"><button id="first" type="button">First</button><button id="second" type="button">Second</button><button id="third" type="button">Third</button></div></section></main>' })(App);
  const html = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html lang="en"><head><title>Layout fixture</title><link rel="stylesheet" href="./layout.css"></head><body><vf-layout-test></vf-layout-test></body></html>' });
  await writeFile(path.join(outDir, 'angular.html'), html);
}

if (port === 'elements') {
  const markup = '<main><vf-container id="container" size="sm" gutter="md"><vf-stack id="stack" gap="lg" align="start"><h1 id="heading">Layout fixture</h1><vf-cluster id="actions" dir="rtl" gap="sm" align="center" justify="space-between"><button id="first" type="button">First</button><button id="second" type="button">Second</button><button id="third" type="button">Third</button></vf-cluster></vf-stack></vf-container></main>';
  await writeFile(path.join(outDir, 'elements.html'), page(markup, '<script type="module" src="./elements.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'elements-layout.ts', contents: "import { defineLayoutElements } from '@vyrnforge/elements/layout'; defineLayoutElements();" }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'elements.js') });
}
