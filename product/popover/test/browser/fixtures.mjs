import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'popover',
  prepare: async ({ port }) => {
    const dir = path.join(process.cwd(), 'dist/browser-fixtures/components/popover');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><title>Popover browser fixture</title></head><body><main><h1>Popover browser fixture</h1><button id="t" aria-expanded="false" aria-controls="c">Open</button><div id="c" role="dialog" aria-labelledby="popover-title" hidden><h2 id="popover-title">Popover details</h2><p>Content</p></div></main><script>t.onclick=()=>{const o=t.getAttribute('aria-expanded')==='true';t.setAttribute('aria-expanded',String(!o));c.hidden=o}</script></body></html>`);
  },
};
