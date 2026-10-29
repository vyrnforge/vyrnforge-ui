import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'visually-hidden',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/visually-hidden');
    await mkdir(outDir, { recursive: true });
    const foundationCss = await readFile(path.join(root, 'packages/web/dist/styles/foundation.css'), 'utf8');
    const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    await writeFile(path.join(outDir, 'visually-hidden.css'), `${tokensCss}\n${foundationCss.replace('@import "./tokens.css";\n', '')}`);
    const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./visually-hidden.css"><title>VisuallyHidden fixture</title></head><body><main><h1>VisuallyHidden fixture</h1>${body}</main></body></html>`;
    if (port === 'web') await writeFile(path.join(outDir, 'web.html'), page('<span id="hidden-label" data-vf-visually-hidden>Notifications</span>'));
    if (port === 'react') { const { createElement } = await import('react'); const { renderToStaticMarkup } = await import('react-dom/server'); const { VisuallyHidden } = await import('@vyrnforge/react/visually-hidden'); await writeFile(path.join(outDir, 'react.html'), page(renderToStaticMarkup(createElement(VisuallyHidden, { id: 'hidden-label' }, 'Notifications')))); }
    if (port === 'vue') { const { createSSRApp, h } = await import('vue'); const { renderToString } = await import('@vue/server-renderer'); const { VisuallyHidden } = await import('@vyrnforge/vue/visually-hidden'); const html = await renderToString(createSSRApp({ render: () => h(VisuallyHidden, { id: 'hidden-label' }, () => 'Notifications') })); await writeFile(path.join(outDir, 'vue.html'), page(html)); }
    if (port === 'angular') { await import('@angular/compiler'); const { Component, provideZonelessChangeDetection } = await import('@angular/core'); const { bootstrapApplication } = await import('@angular/platform-browser'); const { renderApplication } = await import('@angular/platform-server'); const { VfVisuallyHiddenDirective } = await import('@vyrnforge/angular/visually-hidden'); class App {} Component({ selector: 'vf-visually-hidden-test', standalone: true, imports: [VfVisuallyHiddenDirective], template: '<main><h1>VisuallyHidden fixture</h1><span id="hidden-label" vfVisuallyHidden>Notifications</span></main>' })(App); const html = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./visually-hidden.css"><title>VisuallyHidden fixture</title></head><body><vf-visually-hidden-test></vf-visually-hidden-test></body></html>' }); await writeFile(path.join(outDir, 'angular.html'), html); }
  },
};
