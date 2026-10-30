import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'multi-select',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/multi-select');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/multi-select.css";',
        resolveDir: root,
        sourcefile: 'multi-select-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Multi-select browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Multi-select browser fixture</h1><p id="multi-select-label">Choose items</p><div id="multi-select-content" role="listbox" aria-multiselectable="true" aria-labelledby="multi-select-label" data-vf-multi-select-content><button role="option" aria-selected="false" id="a" data-vf-multi-select-option>A</button><button role="option" aria-selected="false" id="b" data-vf-multi-select-option>B</button></div></main><script>[a,b].forEach(x=>x.onclick=()=>x.setAttribute('aria-selected',String(x.getAttribute('aria-selected')!=='true')))</script></body></html>`);
  },
};
