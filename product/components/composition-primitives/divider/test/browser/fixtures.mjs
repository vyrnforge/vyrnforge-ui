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
    await writeFile(path.join(output, 'divider.css'), tokens + '\n' + divider + '\n' +
      'body { padding: 24px; font-family: sans-serif; }' +
      '#horizontal-container { inline-size: 16rem; }' +
      '#vertical-container { display:flex; align-items:center; gap:1rem; min-block-size:3rem; }');

    const web = '<div id="horizontal-container"><span id="horizontal" aria-hidden="true" data-vf-divider data-vf-divider-orientation="horizontal"></span></div>' +
      '<div id="vertical-container"><span>Start</span><span id="vertical" aria-hidden="true" data-vf-divider data-vf-divider-orientation="vertical"></span><span>End</span></div>';
    let body = web;
    if (port === 'react') {
      const { createElement: h } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { Divider } = await import('@vyrnforge/react/divider');
      body = renderToString(h('main', null,
        h('div', { id: 'horizontal-container' },
          h(Divider, { id: 'horizontal' })),
        h('div', { id: 'vertical-container' },
          h('span', null, 'Start'),
          h(Divider, { id: 'vertical', orientation: 'vertical' }),
          h('span', null, 'End'))));
    }
    await writeFile(path.join(output, port + '.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./divider.css"></head><body>' + body + '</body></html>');
  },
};
