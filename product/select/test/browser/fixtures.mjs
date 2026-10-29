import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'select',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/select');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/select.css";',
        resolveDir: root,
        sourcefile: 'select-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Select browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Select browser fixture</h1><div id="select-label">Choose an option</div><button id="trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="list" data-vf-select-trigger>Choose</button><div id="list" role="listbox" aria-labelledby="select-label" hidden><button role="option" aria-selected="false" id="opt">One</button></div></main><script>trigger.onclick=()=>{list.hidden=false;trigger.setAttribute('aria-expanded','true')};opt.onclick=()=>{opt.setAttribute('aria-selected','true');list.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.focus()}</script></body></html>`);
  },
};
