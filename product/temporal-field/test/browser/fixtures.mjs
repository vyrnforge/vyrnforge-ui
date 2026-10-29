import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'temporal-field',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/temporal-field');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/temporal-field.css";',
        resolveDir: root,
        sourcefile: 'temporal-field-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(
      path.join(dir, `${port}.html`),
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Temporal field browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Temporal field browser fixture</h1><div id="root" data-vf-temporal-field-root><input id="date" type="date" aria-label="Date"></div></main></body></html>',
    );
  },
};
