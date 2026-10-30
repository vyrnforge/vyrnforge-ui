import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'number-field',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/number-field');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/number-field.css";',
        resolveDir: root,
        sourcefile: 'number-field-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Number field browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Number field browser fixture</h1><div data-vf-number-field-root><button id="dec" type="button" aria-label="Decrease value" data-vf-number-field-decrement>−</button><input id="input" type="number" aria-label="Quantity" min="0" max="10" step="1" value="2" data-vf-number-field-input><button id="inc" type="button" aria-label="Increase value" data-vf-number-field-increment>+</button></div></main><script>inc.onclick=()=>{input.stepUp();input.dispatchEvent(new Event('input',{bubbles:true}))};dec.onclick=()=>{input.stepDown();input.dispatchEvent(new Event('input',{bubbles:true}))};</script></body></html>`);
  },
};
