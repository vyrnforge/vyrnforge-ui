import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
const port = process.argv[2] || 'web';
const root = process.cwd();
const outDir = path.join(root, 'dist/browser-fixtures/components/icon');
await mkdir(outDir, { recursive: true });
const css = await readFile(path.join(root, 'packages/web/dist/components/icon/icon.css'), 'utf8');
await writeFile(path.join(outDir, 'icon.css'), css);
const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./icon.css"><title>Icon fixture</title></head><body><main><h1>Icon fixture</h1>${body}</main>${script}</body></html>`;
const pathRounded = '<path d="M7.5 3.5h9A1.5 1.5 0 0 1 18 5v15l-6-3.75L6 20V5a1.5 1.5 0 0 1 1.5-1.5Z" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"></path>';
if (port === 'web') await writeFile(path.join(outDir, 'web.html'), page(`<svg id="decorative" data-vf-icon data-vf-icon-name="bookmark" data-vf-variant="outlined" data-vf-shape="rounded" data-vf-size="md" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${pathRounded}</svg><svg id="meaningful" data-vf-icon data-vf-icon-name="bookmark" data-vf-variant="outlined" data-vf-shape="rounded" data-vf-size="lg" viewBox="0 0 24 24" role="img" aria-label="Bookmark" focusable="false">${pathRounded}</svg>`));
if (port === 'react') {
  const { createElement } = await import('react'); const { renderToString } = await import('react-dom/server'); const { Icon } = await import('@vyrnforge/react/icon'); const { bookmarkIcon } = await import('@vyrnforge/icons/bookmark');
  const markup = renderToString(createElement('div', null, createElement(Icon,{id:'decorative',icon:bookmarkIcon}),createElement(Icon,{id:'meaningful',icon:bookmarkIcon,variant:'filled',shape:'sharp',size:'lg',label:'Bookmark'})));
  await writeFile(path.join(outDir,'react.html'),page(`<div id="root">${markup}</div>`));
}
if (port === 'vue') {
  const { createSSRApp, h } = await import('vue'); const { renderToString } = await import('@vue/server-renderer'); const { Icon } = await import('@vyrnforge/vue/icon'); const { bookmarkIcon } = await import('@vyrnforge/icons/bookmark');
  const markup = await renderToString(createSSRApp({render:()=>h('div',null,[h(Icon,{id:'decorative',icon:bookmarkIcon}),h(Icon,{id:'meaningful',icon:bookmarkIcon,variant:'filled',shape:'sharp',size:'lg',label:'Bookmark'})])}));
  await writeFile(path.join(outDir,'vue.html'),page(markup));
}
if (port === 'angular') {
  await import('@angular/compiler'); const { Component, provideZonelessChangeDetection } = await import('@angular/core'); const { bootstrapApplication } = await import('@angular/platform-browser'); const { renderApplication } = await import('@angular/platform-server'); const { VfIconComponent } = await import('@vyrnforge/angular/icon'); const { bookmarkIcon } = await import('@vyrnforge/icons/bookmark');
  class App { bookmark=bookmarkIcon; } Component({selector:'vf-icon-test',standalone:true,imports:[VfIconComponent],template:'<main><h1>Icon fixture</h1><vf-icon id="decorative" [icon]="bookmark"/><vf-icon id="meaningful" [icon]="bookmark" variant="filled" shape="sharp" size="lg" label="Bookmark"/></main>'})(App);
  const html=await renderApplication((context)=>bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]},context),{document:'<!doctype html><html lang="en"><head><title>Icon fixture</title><link rel="stylesheet" href="./icon.css"></head><body><vf-icon-test></vf-icon-test></body></html>'}); await writeFile(path.join(outDir,'angular.html'),html);
}
if (port === 'elements') {
  await writeFile(path.join(outDir,'elements.html'),page('<vf-icon id="decorative"></vf-icon><vf-icon id="meaningful" variant="filled" shape="sharp" size="lg" label="Bookmark"></vf-icon>','<script type="module" src="./elements.js"></script>'));
  await build({stdin:{resolveDir:root,sourcefile:'elements-icon.ts',contents:`import {defineIconElement} from '@vyrnforge/elements/icon';import {bookmarkIcon} from '@vyrnforge/icons/bookmark';defineIconElement();document.querySelectorAll('vf-icon').forEach((el)=>{el.icon=bookmarkIcon;});`},bundle:true,format:'esm',platform:'browser',outfile:path.join(outDir,'elements.js')});
}
