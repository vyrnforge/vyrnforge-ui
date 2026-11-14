import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'preview-card',
  prepare: async ({ port }) => {
    const dir = path.join(process.cwd(), 'dist/browser-fixtures/components/preview-card');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${port}.html`), '<!doctype html><html lang="en"><head><title>Preview card browser fixture</title></head><body><main><h1>Preview card browser fixture</h1><a id="t" href="#profile" aria-controls="c" aria-expanded="true">Profile</a><div id="c">Profile preview</div></main></body></html>');
  },
};
