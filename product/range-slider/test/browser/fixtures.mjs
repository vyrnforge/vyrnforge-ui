import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'range-slider',
  prepare: async ({ port }) => {
    const dir = path.join(process.cwd(), 'dist/browser-fixtures/components/range-slider');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${port}.html`), '<!doctype html><html lang="en"><head><title>Range slider browser fixture</title></head><body><main><h1>Range slider browser fixture</h1><input id="min" type="range" min="0" max="80" value="20" aria-label="Minimum"><input id="max" type="range" min="20" max="100" value="80" aria-label="Maximum"></main></body></html>');
  },
};
