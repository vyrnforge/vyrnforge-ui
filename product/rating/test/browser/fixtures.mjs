import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'rating',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/rating');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/rating.css";',
        resolveDir: root,
        sourcefile: 'rating-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(
      path.join(dir, `${port}.html`),
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Rating browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Rating browser fixture</h1><div id="root" data-vf-rating-root role="radiogroup" aria-label="Rating"><label id="one-item" data-vf-rating-item><input id="one" type="radio" name="r" aria-label="1 star">☆</label><label id="five-item" data-vf-rating-item><input id="five" type="radio" name="r" aria-label="5 stars">☆</label></div></main></body></html>',
    );
  },
};
