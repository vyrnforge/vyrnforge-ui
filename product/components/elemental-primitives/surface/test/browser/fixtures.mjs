import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'surface',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/surface');
    await mkdir(outDir, { recursive: true });

    const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const surfaceCss = (await readFile(path.join(root, 'packages/web/dist/components/surface/surface.css'), 'utf8')).replace('@import "../../styles/tokens.css";\n', '');
    const fixtureCss = 'body { margin: 0; background: var(--vf-color-surface); color: var(--vf-color-text); --vf-radius-surface: 0.75rem; } #surface { inline-size: 20rem; } #surface > * { margin: 0; }';
    await writeFile(path.join(outDir, 'surface.css'), `${tokensCss}\n${surfaceCss}\n${fixtureCss}`);

    const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./surface.css"><title>Surface fixture</title></head><body><main><h1>Surface fixture</h1>${body}</main>${script}</body></html>`;
    const content = '<h2>Release summary</h2><p>Visual containment only.</p>';

    if (port === 'web') {
      await writeFile(path.join(outDir, 'web.html'), page(`<article id="surface" data-vf-surface aria-label="Release summary">${content}</article>`));
    }

    if (port === 'react') {
      const { createElement } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { Surface } = await import('@vyrnforge/react/surface');
      const markup = renderToString(createElement(Surface, { as: 'article', id: 'surface', 'aria-label': 'Release summary' }, createElement('h2', null, 'Release summary'), createElement('p', null, 'Visual containment only.')));
      await writeFile(path.join(outDir, 'react.html'), page(markup));
    }

    if (port === 'vue') {
      const { createSSRApp, h } = await import('vue');
      const { renderToString } = await import('@vue/server-renderer');
      const { Surface } = await import('@vyrnforge/vue/surface');
      const app = createSSRApp({ render: () => h(Surface, { as: 'article', id: 'surface', 'aria-label': 'Release summary' }, () => [h('h2', 'Release summary'), h('p', 'Visual containment only.')]) });
      const markup = await renderToString(app);
      await writeFile(path.join(outDir, 'vue.html'), page(markup));
    }

    if (port === 'angular') {
      await import('@angular/compiler');
      const { Component, provideZonelessChangeDetection } = await import('@angular/core');
      const { bootstrapApplication } = await import('@angular/platform-browser');
      const { renderApplication } = await import('@angular/platform-server');
      const { VfSurfaceDirective } = await import('@vyrnforge/angular/surface');
      class App {}
      Component({ selector: 'vf-surface-test', standalone: true, imports: [VfSurfaceDirective], template: '<main><h1>Surface fixture</h1><article id="surface" vfSurface aria-label="Release summary"><h2>Release summary</h2><p>Visual containment only.</p></article></main>' })(App);
      const html = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html lang="en"><head><title>Surface fixture</title><link rel="stylesheet" href="./surface.css"></head><body><vf-surface-test></vf-surface-test></body></html>' });
      await writeFile(path.join(outDir, 'angular.html'), html);
    }

    if (port === 'elements') {
      const markup = `<vf-surface id="surface" aria-label="Release summary">${content}</vf-surface>`;
      await writeFile(path.join(outDir, 'elements.html'), page(markup, '<script type="module" src="./elements.js"></script>'));
      await build({ stdin: { resolveDir: root, sourcefile: 'elements-surface.ts', contents: "import { defineSurfaceElement } from '@vyrnforge/elements/surface'; defineSurfaceElement();" }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'elements.js') });
    }
  },
};
