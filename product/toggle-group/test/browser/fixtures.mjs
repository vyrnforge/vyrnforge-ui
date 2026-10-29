import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'toggle-group',
  prepare: async ({ port }) => {
    const dir = path.join(process.cwd(), 'dist/browser-fixtures/components/toggle-group');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><title>Toggle group browser fixture</title></head><body><main><h1>Toggle group browser fixture</h1><div role="group" aria-label="Formatting"><button aria-pressed="false" id="bold">Bold</button></div></main><script>bold.onclick=()=>bold.setAttribute('aria-pressed',String(bold.getAttribute('aria-pressed')!=='true'))</script></body></html>`);
  },
};
