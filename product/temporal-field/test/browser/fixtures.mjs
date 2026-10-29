import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'temporal-field',
  prepare: async ({ port }) => {
    const dir = path.join(process.cwd(), 'dist/browser-fixtures/components/temporal-field');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${port}.html`), '<!doctype html><html lang="en"><head><title>Temporal field browser fixture</title></head><body><main><h1>Temporal field browser fixture</h1><div data-vf-temporal-field-root><input id="date" type="date" aria-label="Date"></div></main></body></html>');
  },
};
