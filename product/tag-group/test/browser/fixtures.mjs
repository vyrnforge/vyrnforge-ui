import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'tag-group',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/tag-group');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/tag-group.css";',
        resolveDir: root,
        sourcefile: 'tag-group-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(
      path.join(dir, `${port}.html`),
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Tag group browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Tag group browser fixture</h1><div id="root" data-vf-tag-group-root role="list"><div data-vf-tag-group-item role="listitem" id="tag">Design <button data-vf-tag-group-remove aria-label="Remove Design" id="remove">×</button></div></div></main><script>remove.onclick=()=>tag.remove()</script></body></html>',
    );
  },
};
