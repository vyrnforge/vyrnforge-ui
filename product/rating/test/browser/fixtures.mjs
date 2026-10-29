import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'rating',
  prepare: async ({ port }) => {
    const dir = path.join(process.cwd(), 'dist/browser-fixtures/components/rating');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${port}.html`), '<!doctype html><html lang="en"><head><title>Rating browser fixture</title></head><body><main><h1>Rating browser fixture</h1><div role="radiogroup" aria-label="Rating"><label><input type="radio" name="r" aria-label="1 star"></label><label><input id="five" type="radio" name="r" aria-label="5 stars"></label></div></main></body></html>');
  },
};
