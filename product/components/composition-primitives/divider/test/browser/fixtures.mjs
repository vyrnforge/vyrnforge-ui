import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'divider',
  prepare: async ({ port }) => {
    if (port !== 'web' && port !== 'react') return;
    const root = process.cwd();
    const output = path.join(root, 'dist/browser-fixtures/components/divider');
    await mkdir(output, { recursive: true });
    const tokens = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const divider = (await readFile(path.join(root, 'packages/web/dist/components/divider/divider.css'), 'utf8'))
      .replace(/^@import\s+["'][^"']+["'];\s*$/gm, '');
    const fixtureCss = [
      'body { padding: 24px; font-family: sans-serif; }',
      '#horizontal-container { inline-size: 16rem; }',
      '#vertical-container { display:flex; align-items:center; gap:1rem; min-block-size:3rem; }',
      '#labeled-horizontal { display:flex; flex-direction:column; gap:1rem; inline-size:min(100%,20rem); }',
      '#labeled-vertical { display:flex; align-items:center; gap:2rem; min-block-size:12rem; }',
    ].join('\n');
    await writeFile(path.join(output, 'divider.css'), tokens + '\n' + divider + '\n' + fixtureCss);

    const aligns = ['start', 'center', 'end'];
    const labelText = (align) => align === 'center' ? 'OR' : align === 'start' ? 'Start' : 'End';
    const nativeLabel = (orientation, align) =>
      '<span id="' + orientation + '-label-' + align + '" data-vf-divider ' +
      'data-vf-divider-orientation="' + orientation + '" data-vf-divider-labeled ' +
      'data-vf-divider-align="' + align + '"><span data-vf-divider-label>' +
      labelText(align) + '</span></span>';
    const web = '<div id="horizontal-container"><span id="horizontal" aria-hidden="true" data-vf-divider data-vf-divider-orientation="horizontal"></span></div>' +
      '<div id="vertical-container"><span>Start</span><span id="vertical" aria-hidden="true" data-vf-divider data-vf-divider-orientation="vertical"></span><span>End</span></div>' +
      '<section id="labeled-horizontal" aria-label="Horizontal labels">' +
      aligns.map(align => nativeLabel('horizontal', align)).join('') + '</section>' +
      '<section id="labeled-vertical" aria-label="Vertical labels">' +
      aligns.map(align => nativeLabel('vertical', align)).join('') + '</section>';

    let body = '<main><h1>Visual divider fixture</h1>' + web + '</main>';
    if (port === 'react') {
      const { createElement: h } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { Divider } = await import('@vyrnforge/react/divider');
      body = renderToString(h('main', null,
        h('h1', null, 'Visual divider fixture'),
        h('div', { id: 'horizontal-container' }, h(Divider, { id: 'horizontal' })),
        h('div', { id: 'vertical-container' },
          h('span', null, 'Start'),
          h(Divider, { id: 'vertical', orientation: 'vertical' }),
          h('span', null, 'End')),
        h('section', { id: 'labeled-horizontal', 'aria-label': 'Horizontal labels' },
          ...aligns.map(align => h(Divider, {
            id: 'horizontal-label-' + align, key: align, textAlign: align,
          }, labelText(align)))),
        h('section', { id: 'labeled-vertical', 'aria-label': 'Vertical labels' },
          ...aligns.map(align => h(Divider, {
            id: 'vertical-label-' + align, key: align, orientation: 'vertical', textAlign: align,
          }, labelText(align))))));
    }
    await writeFile(path.join(output, port + '.html'),
      '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width"><title>Visual Divider fixture</title>' +
      '<link rel="stylesheet" href="./divider.css"></head><body>' + body + '</body></html>');
  },
};
