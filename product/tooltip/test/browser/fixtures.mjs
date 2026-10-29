import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'tooltip',
  prepare: async ({ port }) => {
    const dir = path.join(process.cwd(), 'dist/browser-fixtures/components/tooltip');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${port}.html`), '<!doctype html><html lang="en"><head><title>Tooltip browser fixture</title></head><body><main><h1>Tooltip browser fixture</h1><button id="t" aria-describedby="tip">Info</button><div id="tip" role="tooltip">More information</div></main></body></html>');
  },
};
