import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'segmented-control',
  prepare: async ({ port }) => {
    const dir = path.join(process.cwd(), 'dist/browser-fixtures/components/segmented-control');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><title>Segmented control browser fixture</title></head><body><main><h1>Segmented control browser fixture</h1><div role="radiogroup" aria-label="View"><button role="radio" aria-checked="true" id="list">List</button><button role="radio" aria-checked="false" id="grid">Grid</button></div></main><script>[list,grid].forEach(x=>x.onclick=()=>[list,grid].forEach(y=>y.setAttribute('aria-checked',String(x===y))))</script></body></html>`);
  },
};
