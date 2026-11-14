import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'menubar',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/menubar');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/menubar.css";',
        resolveDir: root,
        sourcefile: 'menubar-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(
      path.join(dir, `${port}.html`),
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Menubar browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Menubar browser fixture</h1><div role="menubar" id="bar" data-vf-menubar-root><button role="menuitem" id="file" data-vf-menubar-trigger>File</button><button role="menuitem" id="edit" data-vf-menubar-trigger>Edit</button></div></main><script>bar.onkeydown=e=>{const a=[file,edit],i=a.indexOf(document.activeElement);if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();a[(i+(e.key==='ArrowRight'?1:-1)+a.length)%a.length].focus()}}</script></body></html>`,
    );
  },
};
