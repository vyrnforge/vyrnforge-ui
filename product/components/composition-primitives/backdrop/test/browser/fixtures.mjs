import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
export const browserFixture = {
  component: 'backdrop',
  prepare: async ({ port }) => {
    if (!['web', 'react'].includes(port)) return false;
    const outDir = path.join(process.cwd(), 'dist/browser-fixtures/components/backdrop');
    await mkdir(outDir, { recursive: true });
    await build({ stdin: { contents: '@import "@vyrnforge/web/styles/backdrop.css";\n@import "@vyrnforge/web/styles/dialog.css";', loader: 'css', resolveDir: process.cwd() }, bundle: true, outfile: path.join(outDir, 'backdrop.css') });
    let scrim = '<div id="scrim" data-vf-backdrop aria-hidden="true"></div>';
    if (port === 'react') {
      const { createElement: h } = await import('react');
      const { renderToStaticMarkup } = await import('react-dom/server');
      const { Backdrop } = await import('@vyrnforge/react/backdrop');
      scrim = renderToStaticMarkup(h(Backdrop, { id: 'scrim' }));
    }
    await writeFile(path.join(outDir, port + '.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Backdrop fixture</title><link rel="stylesheet" href="./backdrop.css"></head><body><main><h1>Backdrop paint</h1><section id="region" aria-label="Account" style="position:relative;isolation:isolate;width:240px;height:120px;border-radius:8px"><button id="under" type="button">Underlying action</button>' + scrim + '</section><p role="status">Refreshing account</p><button id="open" type="button" onclick="document.querySelector(\'#dialog\').showModal()">Open dialog</button><dialog id="dialog" data-vf-dialog-root aria-labelledby="title"><h2 id="title">Native modal</h2><button onclick="this.closest(\'dialog\').close()">Close</button></dialog></main><script>document.querySelector("#under").addEventListener("click",()=>document.body.dataset.activated="true")</script></body></html>');
    return true;
  },
};
