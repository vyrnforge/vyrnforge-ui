import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'toggle-group',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/toggle-group');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/toggle-group.css";',
        resolveDir: root,
        sourcefile: 'toggle-group-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Toggle group browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Toggle group browser fixture</h1><div role="group" aria-label="Formatting" id="group" data-vf-toggle-group-root><button aria-pressed="false" id="bold" data-vf-toggle-group-item>Bold</button></div></main><script>bold.onclick=()=>bold.setAttribute('aria-pressed',String(bold.getAttribute('aria-pressed')!=='true'))</script></body></html>`);
  },
};
