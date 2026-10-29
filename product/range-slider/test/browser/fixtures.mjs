import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'range-slider',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/range-slider');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/range-slider.css";',
        resolveDir: root,
        sourcefile: 'range-slider-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(
      path.join(dir, `${port}.html`),
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Range slider browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Range slider browser fixture</h1><div id="root" data-vf-range-slider-root><input id="min" type="range" min="0" max="80" value="20" aria-label="Minimum"><input id="max" type="range" min="20" max="100" value="80" aria-label="Maximum"></div></main></body></html>',
    );
  },
};
