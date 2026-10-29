import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'color-picker',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/color-picker');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/color-picker.css";',
        resolveDir: root,
        sourcefile: 'color-picker-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Color picker browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Color picker browser fixture</h1><div id="root" data-vf-color-picker-root><input id="color" data-vf-color-picker-input type="color" aria-label="Choose color" value="#3366ff"><input id="text" type="text" aria-label="Color value" value="#3366ff"><span id="swatch" data-vf-color-picker-swatch aria-hidden="true" style="display:inline-block;background:#3366ff"></span></div></main><script>function sync(v){if(!/^#[0-9a-f]{6}$/i.test(v))return;color.value=v;text.value=v;swatch.style.backgroundColor=v}text.addEventListener('input',()=>sync(text.value));color.addEventListener('input',()=>sync(color.value));</script></body></html>`);
  },
};
