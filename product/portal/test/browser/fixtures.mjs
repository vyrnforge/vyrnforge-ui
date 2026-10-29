import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'portal',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/portal');
    await mkdir(outDir, { recursive: true });
    const page = (script) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Portal fixture</title></head><body><main><h1>Portal fixture</h1><div id="app"></div><div id="portal-target" aria-label="Portal target"></div></main><script type="module" src="./${script}"></script></body></html>`;
    if (port === 'react') await build({ stdin: { resolveDir: root, sourcefile: 'portal-react.ts', contents: `import{createElement}from'react';import{createRoot}from'react-dom/client';import{Portal}from'@vyrnforge/react/portal';createRoot(document.querySelector('#app')).render(createElement(Portal,{target:document.querySelector('#portal-target')},createElement('button',{id:'portal-content'},'Action')));` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'react.js') });
    if (port === 'vue') await build({ stdin: { resolveDir: root, sourcefile: 'portal-vue.ts', contents: `import{createApp,h}from'vue';import{Portal}from'@vyrnforge/vue/portal';createApp({render:()=>h(Portal,{to:'#portal-target'},()=>h('button',{id:'portal-content'},'Action'))}).mount('#app');` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'vue.js') });
    if (port === 'angular') await build({ stdin: { resolveDir: root, sourcefile: 'portal-angular.ts', contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{VfPortalDirective}from'@vyrnforge/angular/portal';class App{target=document.querySelector('#portal-target')}Component({selector:'vf-portal-test',standalone:true,imports:[VfPortalDirective],template:'<ng-template [vfPortal]="target"><button id="portal-content">Action</button></ng-template>'})(App);document.querySelector('#app').innerHTML='<vf-portal-test></vf-portal-test>';bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'angular.js') });
    if (port === 'elements') await build({ stdin: { resolveDir: root, sourcefile: 'portal-elements.ts', contents: `import{definePortalElement}from'@vyrnforge/elements/portal';definePortalElement();document.querySelector('#app').innerHTML='<vf-portal target="#portal-target"><button id="portal-content">Action</button></vf-portal>';` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'elements.js') });
    await writeFile(path.join(outDir, `${port}.html`), page(`${port}.js`));
  },
};
