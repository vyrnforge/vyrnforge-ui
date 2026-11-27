import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'skeleton',
  prepare: async ({ port }) => {
    if (port !== 'web') return false;
    const { build } = await import('esbuild');
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/skeleton');
    await mkdir(outDir, { recursive: true });
    await build({ stdin: { contents: '@import "@vyrnforge/web/styles/skeleton.css";', loader: 'css', resolveDir: root }, bundle: true, outfile: path.join(outDir, 'skeleton.css') });
    const body = `<div id="line" data-vf-skeleton data-vf-skeleton-shape="line" aria-hidden="true"></div>
        <div id="block" data-vf-skeleton data-vf-skeleton-shape="block" aria-hidden="true"></div>
        <div id="circle" data-vf-skeleton data-vf-skeleton-shape="circle" aria-hidden="true"></div>`;
    await writeFile(path.join(outDir, 'web.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Skeleton fixture</title><link rel="stylesheet" href="./skeleton.css"></head><body><main><h1>Skeleton</h1>' + body + '</main></body></html>');
    return true;
  },
};
