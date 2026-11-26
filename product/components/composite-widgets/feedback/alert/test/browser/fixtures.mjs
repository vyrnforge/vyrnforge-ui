import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
export const browserFixture = {
  component: 'alert',
  prepare: async ({port}) => {
    if (!['web','react'].includes(port)) return false;
    const outDir = path.join(process.cwd(), 'dist/browser-fixtures/components/alert');
    await mkdir(outDir,{recursive:true});
    await build({stdin:{contents:'@import "@vyrnforge/web/styles/alert.css";',loader:'css',resolveDir:process.cwd()},bundle:true,outfile:path.join(outDir,'fixture.css')});
    let body = '<div data-vf-feedback data-vf-feedback-severity="critical" data-vf-alert data-vf-alert-variant="subtle" id="static"><div data-vf-alert-message>Service unavailable</div></div><div data-vf-feedback data-vf-feedback-severity="success" data-vf-alert data-vf-alert-variant="outlined" id="dynamic"><div data-vf-alert-message role="status">Saved</div><div data-vf-alert-actions><button type="button">Details</button></div></div>';
    if (port === 'react') {
      const {createElement:h} = await import('react');
      const {renderToStaticMarkup} = await import('react-dom/server');
      const { Alert } = await import('@vyrnforge/react/alert');
      body = renderToStaticMarkup(h('div', null,
        h(Alert, {id:'static',severity:'critical'}, 'Service unavailable'),
        h(Alert, {id:'dynamic',severity:'success',variant:'outlined',announcement:'polite',actions:h('button',{type:'button'},'Details')}, 'Saved')));
    }
    await writeFile(path.join(outDir,port+'.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>alert</title><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./fixture.css"><style>body{background:var(--vf-color-surface);color:var(--vf-color-text)}</style></head><body><main><h1>Feedback</h1>'+body+'</main></body></html>');
    return true;
  },
};
