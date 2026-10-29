import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'accordion',
  prepare: async ({ port }) => {
    const dir = path.join(process.cwd(), 'dist/browser-fixtures/components/accordion');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${port}.html`), '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Accordion browser fixture</title></head><body><main><h1>Accordion browser fixture</h1><button id="a" aria-expanded="false" aria-controls="p">Section</button><div id="p" role="region" aria-labelledby="a" hidden>Content</div></main><script>a.onclick=()=>{const o=a.getAttribute(\'aria-expanded\')===\'true\';a.setAttribute(\'aria-expanded\',String(!o));p.hidden=o}</script></body></html>');
  },
};
