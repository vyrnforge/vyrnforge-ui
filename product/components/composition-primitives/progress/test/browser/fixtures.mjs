import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'progress',
  prepare: async ({ port }) => {
    if (port !== 'web') return false;
    const { build } = await import('esbuild');
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/progress');
    await mkdir(outDir, { recursive: true });
    await build({ stdin: { contents: '@import "@vyrnforge/web/styles/progress.css";', loader: 'css', resolveDir: root }, bundle: true, outfile: path.join(outDir, 'progress.css') });
    const body = `<progress id="known" data-vf-progress aria-label="Upload" value="48" max="100"></progress>
        <progress id="unknown" data-vf-progress aria-label="Preparing"></progress>`;
    await writeFile(path.join(outDir, 'web.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Progress fixture</title><link rel="stylesheet" href="./progress.css"></head><body><main><h1>Progress</h1>' + body + '</main></body></html>');
    return true;
  },
};
