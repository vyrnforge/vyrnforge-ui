import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'tag-group',
  prepare: async ({ port }) => {
    const dir = path.join(process.cwd(), 'dist/browser-fixtures/components/tag-group');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${port}.html`), '<!doctype html><html lang="en"><head><title>Tag group browser fixture</title></head><body><main><h1>Tag group browser fixture</h1><div role="list"><div role="listitem" id="tag">Design <button aria-label="Remove Design" id="remove">×</button></div></div></main><script>remove.onclick=()=>tag.remove()</script></body></html>');
  },
};
