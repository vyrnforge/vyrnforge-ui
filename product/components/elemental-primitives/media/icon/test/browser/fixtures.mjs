import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

function customIconDefinition(defineIcon) {
  return defineIcon({
    name: 'custom-diamond',
    outlined: {
      paths: [{
        d: 'M12 4 20 12 12 20 4 12 12 4Z',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.75,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }],
    },
    filled: {
      paths: [{ d: 'M12 3 21 12 12 21 3 12 12 3Z', fill: 'currentColor' }],
    },
  });
}

export const browserFixture = {
  component: 'icon',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/icon');
    await mkdir(outDir, { recursive: true });
    const css = await readFile(path.join(root, 'packages/web/dist/components/icon/icon.css'), 'utf8');
    await writeFile(path.join(outDir, 'icon.css'), css);

    const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./icon.css"><title>Icon fixture</title></head><body><main><h1>Icon fixture</h1>${body}</main>${script}</body></html>`;
    const bookmarkPath = '<path d="M7.5 3.5h9A1.5 1.5 0 0 1 18 5v15l-6-3.75L6 20V5a1.5 1.5 0 0 1 1.5-1.5Z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>';
    const customPath = '<path d="M12 4 20 12 12 20 4 12 12 4Z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>';

    if (port === 'web') {
      await writeFile(path.join(outDir, 'web.html'), page(
        `<svg id="custom" data-vf-icon data-vf-icon-name="custom-diamond" data-vf-variant="outlined" data-vf-shape="rounded" data-vf-size="md" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${customPath}</svg>
        <svg id="decorative" data-vf-icon data-vf-icon-name="bookmark" data-vf-variant="outlined" data-vf-shape="rounded" data-vf-size="md" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${bookmarkPath}</svg>
        <svg id="meaningful" data-vf-icon data-vf-icon-name="bookmark" data-vf-variant="outlined" data-vf-shape="rounded" data-vf-size="lg" viewBox="0 0 24 24" role="img" aria-label="Bookmark" focusable="false">${bookmarkPath}</svg>`
      ));
    }

    if (port === 'react') {
      const { createElement } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { Icon } = await import('@vyrnforge/react/icon');
      const { bookmarkIcon } = await import('@vyrnforge/icons/bookmark');
      const { defineIcon } = await import('@vyrnforge/web/icon');
      const customIcon = customIconDefinition(defineIcon);
      const markup = renderToString(createElement('div', null,
        createElement(Icon, { id: 'custom', icon: customIcon }),
        createElement(Icon, { id: 'decorative', icon: bookmarkIcon }),
        createElement(Icon, { id: 'meaningful', icon: bookmarkIcon, variant: 'filled', shape: 'sharp', size: 'lg', label: 'Bookmark' })
      ));
      await writeFile(path.join(outDir, 'react.html'), page(`<div id="root">${markup}</div>`));
    }

    if (port === 'vue') {
      const { createSSRApp, h } = await import('vue');
      const { renderToString } = await import('@vue/server-renderer');
      const { Icon } = await import('@vyrnforge/vue/icon');
      const { bookmarkIcon } = await import('@vyrnforge/icons/bookmark');
      const { defineIcon } = await import('@vyrnforge/web/icon');
      const customIcon = customIconDefinition(defineIcon);
      const markup = await renderToString(createSSRApp({
        render: () => h('div', null, [
          h(Icon, { id: 'custom', icon: customIcon }),
          h(Icon, { id: 'decorative', icon: bookmarkIcon }),
          h(Icon, { id: 'meaningful', icon: bookmarkIcon, variant: 'filled', shape: 'sharp', size: 'lg', label: 'Bookmark' }),
        ]),
      }));
      await writeFile(path.join(outDir, 'vue.html'), page(markup));
    }

    if (port === 'angular') {
      await import('@angular/compiler');
      const { Component, provideZonelessChangeDetection } = await import('@angular/core');
      const { bootstrapApplication } = await import('@angular/platform-browser');
      const { renderApplication } = await import('@angular/platform-server');
      const { VfIconComponent } = await import('@vyrnforge/angular/icon');
      const { bookmarkIcon } = await import('@vyrnforge/icons/bookmark');
      const { defineIcon } = await import('@vyrnforge/web/icon');
      const customIcon = customIconDefinition(defineIcon);

      class App {
        bookmark = bookmarkIcon;
        custom = customIcon;
      }

      Component({
        selector: 'vf-icon-test',
        standalone: true,
        imports: [VfIconComponent],
        template: '<main><h1>Icon fixture</h1><vf-icon id="custom" [icon]="custom"/><vf-icon id="decorative" [icon]="bookmark"/><vf-icon id="meaningful" [icon]="bookmark" variant="filled" shape="sharp" size="lg" label="Bookmark"/></main>',
      })(App);

      const html = await renderApplication(
        (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
        { document: '<!doctype html><html lang="en"><head><title>Icon fixture</title><link rel="stylesheet" href="./icon.css"></head><body><vf-icon-test></vf-icon-test></body></html>' }
      );
      await writeFile(path.join(outDir, 'angular.html'), html);
    }

    if (port === 'elements') {
      await writeFile(
        path.join(outDir, 'elements.html'),
        page(
          '<vf-icon id="custom"></vf-icon><vf-icon id="decorative"></vf-icon><vf-icon id="meaningful" variant="filled" shape="sharp" size="lg" label="Bookmark"></vf-icon>',
          '<script type="module" src="./elements.js"></script>'
        )
      );

      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'elements-icon.ts',
          contents: `import { defineIconElement } from '@vyrnforge/elements/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import { defineIcon } from '@vyrnforge/web/icon';

const custom = defineIcon({
  name: 'custom-diamond',
  outlined: { paths: [{ d: 'M12 4 20 12 12 20 4 12 12 4Z', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' }] },
  filled: { paths: [{ d: 'M12 3 21 12 12 21 3 12 12 3Z', fill: 'currentColor' }] },
});

defineIconElement();
document.querySelector('#custom').icon = custom;
document.querySelector('#decorative').icon = bookmarkIcon;
document.querySelector('#meaningful').icon = bookmarkIcon;`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(outDir, 'elements.js'),
      });
    }
  },
};
