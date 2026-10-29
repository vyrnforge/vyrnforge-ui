import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'drawer',
  prepare: async ({ port }) => {
    const dir = path.join(process.cwd(), 'dist/browser-fixtures/components/drawer');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${port}.html`), '<!doctype html><html lang="en"><head><title>Drawer browser fixture</title></head><body><main><h1>Drawer browser fixture</h1><dialog open aria-labelledby="t"><h2 id="t">Settings</h2><button>Close</button></dialog></main></body></html>');
  },
};
