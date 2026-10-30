import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'split-button',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/split-button');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/split-button.css";',
        resolveDir: root,
        sourcefile: 'split-button-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Split button browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Split button browser fixture</h1><div data-vf-split-button-root><button id="action" type="button" data-vf-split-button-action>Save</button><button id="trigger" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="More save options" data-vf-split-button-trigger>More</button><div id="menu" role="menu" hidden><button type="button" role="menuitem">Save as copy</button></div></div></main><script>let primary=0;action.onclick=()=>primary++;trigger.onclick=()=>{menu.hidden=!menu.hidden;trigger.setAttribute('aria-expanded',String(!menu.hidden))};window.primary=()=>primary</script></body></html>`);
  },
};
