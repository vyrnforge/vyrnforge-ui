import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
export const browserFixture = {
  component: 'status-indicator',
  prepare: async ({port}) => {
    if (!['web','react'].includes(port)) return false;
    const outDir = path.join(process.cwd(), 'dist/browser-fixtures/components/status-indicator');
    await mkdir(outDir,{recursive:true});
    await build({stdin:{contents:'@import "@vyrnforge/web/styles/status-indicator.css";',loader:'css',resolveDir:process.cwd()},bundle:true,outfile:path.join(outDir,'fixture.css')});
    let body = ['informational','success','warning','error','critical'].map(t => '<span id="'+t+'" data-vf-feedback data-vf-feedback-severity="'+t+'" data-vf-status-indicator><span data-vf-status-indicator-dot aria-hidden="true"></span>'+t+'</span>').join(' ');
    if (port === 'react') {
      const {createElement:h} = await import('react');
      const {renderToStaticMarkup} = await import('react-dom/server');
      const { StatusIndicator } = await import('@vyrnforge/react/status-indicator');
      body = renderToStaticMarkup(h('div', null, ...['informational','success','warning','error','critical'].map(t => h(StatusIndicator,{key:t,id:t,severity:t},t))));
    }
    await writeFile(path.join(outDir,port+'.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>status-indicator</title><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./fixture.css"><style>body{background:var(--vf-color-surface);color:var(--vf-color-text)}</style></head><body><main><h1>Feedback</h1>'+body+'</main></body></html>');
    return true;
  },
};
