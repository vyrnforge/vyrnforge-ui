import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'split-panel',
  prepare: async ({ port }) => {
    const rootDir = process.cwd();
    const dir = path.join(rootDir, 'dist/browser-fixtures/components/split-panel');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/split-panel.css";',
        resolveDir: rootDir,
        sourcefile: 'split-panel-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });
    await writeFile(path.join(dir, `${port}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Split panel browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Split panel browser fixture</h1><div id="root" data-vf-split-panel-root><section data-vf-split-panel-pane>Primary</section><div id="handle" role="separator" tabindex="0" aria-orientation="vertical" aria-valuemin="10" aria-valuemax="90" aria-valuenow="50" data-vf-split-panel-handle></div><section data-vf-split-panel-pane>Secondary</section></div></main><script>let s=50;handle.onkeydown=e=>{if(e.key==='ArrowLeft')s--;else if(e.key==='ArrowRight')s++;else if(e.key==='Home')s=10;else if(e.key==='End')s=90;else return;e.preventDefault();s=Math.min(90,Math.max(10,s));handle.setAttribute('aria-valuenow',String(s));root.style.setProperty('--vf-split-size',s+'%')};</script></body></html>`);
  },
};
