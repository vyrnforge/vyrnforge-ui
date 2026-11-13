import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'layout',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/layout');
    await mkdir(outDir, { recursive: true });

    const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const layoutCss = (await readFile(path.join(root, 'packages/web/dist/components/layout/layout.css'), 'utf8')).replace('@import "../../styles/tokens.css";\n', '');
    const fixtureCss = 'html { font-size: 16px; } body { margin: 0; padding: 24px; --vf-auto-grid-min-item-size: 9rem; font-family: sans-serif; } #actions { inline-size: 13rem; } #auto-grid { inline-size: 31rem; } #inline { inline-size: 20rem; } #control-group { inline-size: 20rem; } #control-group > input { flex: 1 1 auto; } button { min-inline-size: 6rem; }';
    await writeFile(path.join(outDir, 'layout.css'), `${tokensCss}\n${layoutCss}\n${fixtureCss}`);

    const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./layout.css"><title>L3 composition fixture</title></head><body>${body}</body></html>`;
    const autoGridItems = '<article id="card-a">A</article><article id="card-b">B</article><article id="card-c">C</article><article id="card-d">D</article>';
    const nativeMarkup = `<main id="container" data-vf-container data-vf-container-size="sm" data-vf-container-gutter="md"><section id="stack" data-vf-stack data-vf-stack-gap="lg" data-vf-stack-align="start" data-vf-stack-justify="start" aria-labelledby="heading"><h1 id="heading">L3 composition fixture</h1><section id="auto-grid" data-vf-auto-grid data-vf-auto-grid-gap="sm">${autoGridItems}</section><div id="actions" dir="rtl" data-vf-cluster data-vf-cluster-gap="sm" data-vf-cluster-align="center" data-vf-cluster-justify="space-between"><button id="first" type="button">First</button><button id="second" type="button">Second</button><button id="third" type="button">Third</button></div><div id="inline" data-vf-inline data-vf-inline-gap="sm" data-vf-inline-align="baseline" data-vf-inline-justify="space-between"><span>Alpha</span><strong>Beta</strong></div><div id="control-group" data-vf-control-group data-vf-control-group-orientation="horizontal"><input id="search" aria-label="Search query"><button type="button">Search</button></div></section></main>`;

    if (port === 'web' || port === 'elements') {
      await writeFile(path.join(outDir, `${port}.html`), page(nativeMarkup));
    }

    if (port === 'react') {
      const { createElement } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { AutoGrid, Cluster, Container, ControlGroup, Inline, Stack } = await import('@vyrnforge/react/layout');
      const cards = ['A', 'B', 'C', 'D'].map((label, index) => createElement('article', { id: `card-${String.fromCharCode(97 + index)}`, key: label }, label));
      const markup = renderToString(createElement(Container, { as: 'main', id: 'container', size: 'sm', gutter: 'md' }, createElement(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start', 'aria-labelledby': 'heading' },
        createElement('h1', { id: 'heading' }, 'L3 composition fixture'),
        createElement(AutoGrid, { as: 'section', id: 'auto-grid', gap: 'sm' }, ...cards),
        createElement(Cluster, { id: 'actions', gap: 'sm', align: 'center', justify: 'space-between', dir: 'rtl' }, createElement('button', { id: 'first', type: 'button' }, 'First'), createElement('button', { id: 'second', type: 'button' }, 'Second'), createElement('button', { id: 'third', type: 'button' }, 'Third')),
        createElement(Inline, { id: 'inline', gap: 'sm', align: 'baseline', justify: 'space-between' }, createElement('span', null, 'Alpha'), createElement('strong', null, 'Beta')),
        createElement(ControlGroup, { id: 'control-group', orientation: 'horizontal' }, createElement('input', { id: 'search', 'aria-label': 'Search query' }), createElement('button', { type: 'button' }, 'Search'))
      )));
      await writeFile(path.join(outDir, 'react.html'), page(markup));
    }

    if (port === 'vue') {
      const { createSSRApp, h } = await import('vue');
      const { renderToString } = await import('@vue/server-renderer');
      const { AutoGrid, Cluster, Container, ControlGroup, Inline, Stack } = await import('@vyrnforge/vue/layout');
      const app = createSSRApp({ render: () => h(Container, { as: 'main', id: 'container', size: 'sm', gutter: 'md' }, () => h(Stack, { as: 'section', id: 'stack', gap: 'lg', align: 'start', 'aria-labelledby': 'heading' }, () => [
        h('h1', { id: 'heading' }, 'L3 composition fixture'),
        h(AutoGrid, { as: 'section', id: 'auto-grid', gap: 'sm' }, () => ['A', 'B', 'C', 'D'].map((label, index) => h('article', { id: `card-${String.fromCharCode(97 + index)}` }, label))),
        h(Cluster, { id: 'actions', gap: 'sm', align: 'center', justify: 'space-between', dir: 'rtl' }, () => [h('button', { id: 'first', type: 'button' }, 'First'), h('button', { id: 'second', type: 'button' }, 'Second'), h('button', { id: 'third', type: 'button' }, 'Third')]),
        h(Inline, { id: 'inline', gap: 'sm', align: 'baseline', justify: 'space-between' }, () => [h('span', 'Alpha'), h('strong', 'Beta')]),
        h(ControlGroup, { id: 'control-group', orientation: 'horizontal' }, () => [h('input', { id: 'search', 'aria-label': 'Search query' }), h('button', { type: 'button' }, 'Search')]),
      ])) });
      const markup = await renderToString(app);
      await writeFile(path.join(outDir, 'vue.html'), page(markup));
    }

    if (port === 'angular') {
      await import('@angular/compiler');
      const { Component, provideZonelessChangeDetection } = await import('@angular/core');
      const { bootstrapApplication } = await import('@angular/platform-browser');
      const { renderApplication } = await import('@angular/platform-server');
      const { VfAutoGridDirective, VfClusterDirective, VfContainerDirective, VfControlGroupDirective, VfInlineDirective, VfStackDirective } = await import('@vyrnforge/angular/layout');
      class App {}
      Component({ selector: 'vf-layout-test', standalone: true, imports: [VfAutoGridDirective, VfClusterDirective, VfContainerDirective, VfControlGroupDirective, VfInlineDirective, VfStackDirective], template: `<main id="container" vfContainer vfContainerSize="sm" vfContainerGutter="md"><section id="stack" vfStack vfStackGap="lg" vfStackAlign="start" aria-labelledby="heading"><h1 id="heading">L3 composition fixture</h1><section id="auto-grid" vfAutoGrid vfAutoGridGap="sm"><article id="card-a">A</article><article id="card-b">B</article><article id="card-c">C</article><article id="card-d">D</article></section><div id="actions" dir="rtl" vfCluster vfClusterGap="sm" vfClusterAlign="center" vfClusterJustify="space-between"><button id="first" type="button">First</button><button id="second" type="button">Second</button><button id="third" type="button">Third</button></div><div id="inline" vfInline vfInlineGap="sm" vfInlineAlign="baseline" vfInlineJustify="space-between"><span>Alpha</span><strong>Beta</strong></div><div id="control-group" vfControlGroup><input id="search" aria-label="Search query"><button type="button">Search</button></div></section></main>` })(App);
      const html = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html lang="en"><head><title>L3 composition fixture</title><link rel="stylesheet" href="./layout.css"></head><body><vf-layout-test></vf-layout-test></body></html>' });
      await writeFile(path.join(outDir, 'angular.html'), html);
    }
  },
};
