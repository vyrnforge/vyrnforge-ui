import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'listbox',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/listbox');
    await mkdir(outDir, { recursive: true });

    const listboxCss = await readFile(path.join(root, 'packages/web/dist/components/listbox/listbox.css'), 'utf8');
    const tokenCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    await writeFile(path.join(outDir, 'listbox.css'), `${tokenCss}\n${listboxCss.replace('@import "../../styles/tokens.css";', '')}`);
    const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./listbox.css"><title>Listbox fixture</title></head><body><main><h1>Listbox browser fixture</h1><button id="before">Before</button>${body}<button id="after">After</button></main>${script}</body></html>`;

    const webListbox = `<div id="web-list" role="listbox" aria-label="Choose an item" data-vf-listbox-root><div id="web-one" role="option" tabindex="0" aria-selected="true" data-vf-listbox-option>One</div><div id="web-disabled" role="option" tabindex="-1" aria-selected="false" aria-disabled="true" data-vf-listbox-option>Disabled</div><div id="web-three" role="option" tabindex="0" aria-selected="false" data-vf-listbox-option>Three</div><div id="web-banana" role="option" tabindex="0" aria-selected="false" data-vf-listbox-option>Banana</div></div><div id="web-multi" role="listbox" aria-label="Choose several" aria-multiselectable="true" data-vf-listbox-root><div id="web-multi-one" role="option" tabindex="0" aria-selected="true" data-vf-listbox-option>One</div><div id="web-multi-three" role="option" tabindex="0" aria-selected="false" data-vf-listbox-option>Three</div></div>`;
    if (port === 'web') await writeFile(path.join(outDir, 'web.html'), page(webListbox));

    if (port === 'react') {
      await writeFile(path.join(outDir, 'react.html'), page('<div id="app"></div>', '<script type="module" src="./react.js"></script>'));
      await build({ stdin: { resolveDir: root, sourcefile: 'react-listbox-client.ts', contents: `import{createElement,Fragment}from'react';import{createRoot}from'react-dom/client';import{ListboxRoot,ListboxOption}from'@vyrnforge/react/listbox';const option=(id,value,label,disabled=false)=>createElement(ListboxOption,{id,value,disabled},label);createRoot(document.querySelector('#app')).render(createElement(Fragment,null,createElement(ListboxRoot,{id:'react-list','aria-label':'Choose an item',defaultValue:'one'},option('react-one','one','One'),option('react-disabled','disabled','Disabled',true),option('react-three','three','Three'),option('react-banana','banana','Banana')),createElement(ListboxRoot,{id:'react-multi','aria-label':'Choose several',selectionMode:'multiple',defaultValue:['one']},option('react-multi-one','one','One'),option('react-multi-three','three','Three'))));` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'react.js') });
    }

    if (port === 'vue') {
      await writeFile(path.join(outDir, 'vue.html'), page('<div id="app"></div>', '<script type="module" src="./vue.js"></script>'));
      await build({ stdin: { resolveDir: root, sourcefile: 'vue-listbox-client.ts', contents: `import{createApp,h}from'vue';import{ListboxRoot,ListboxOption}from'@vyrnforge/vue/listbox';const option=(id,value,label,disabled=false)=>h(ListboxOption,{id,value,disabled},()=>label);createApp({render:()=>h('div',[h(ListboxRoot,{id:'vue-list','aria-label':'Choose an item',defaultValue:'one'},()=>[option('vue-one','one','One'),option('vue-disabled','disabled','Disabled',true),option('vue-three','three','Three'),option('vue-banana','banana','Banana')]),h(ListboxRoot,{id:'vue-multi','aria-label':'Choose several',selectionMode:'multiple',defaultValue:['one']},()=>[option('vue-multi-one','one','One'),option('vue-multi-three','three','Three')])])}).mount('#app');` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'vue.js') });
    }

    if (port === 'angular') {
      await writeFile(path.join(outDir, 'angular.html'), page('<vf-listbox-test></vf-listbox-test>', '<script type="module" src="./angular.js"></script>'));
      await build({ stdin: { resolveDir: root, sourcefile: 'angular-listbox-client.ts', contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{VfListboxRootDirective,VfListboxOptionDirective}from'@vyrnforge/angular/listbox';class App{}Component({selector:'vf-listbox-test',standalone:true,imports:[VfListboxRootDirective,VfListboxOptionDirective],template:'<div vfListboxRoot id="angular-list" aria-label="Choose an item" defaultValue="one"><div vfListboxOption="one" id="angular-one">One</div><div vfListboxOption="disabled" id="angular-disabled" [disabled]="true">Disabled</div><div vfListboxOption="three" id="angular-three">Three</div><div vfListboxOption="banana" id="angular-banana">Banana</div></div><div vfListboxRoot id="angular-multi" aria-label="Choose several" selectionMode="multiple" defaultValue="one"><div vfListboxOption="one" id="angular-multi-one">One</div><div vfListboxOption="three" id="angular-multi-three">Three</div></div>'})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'angular.js') });
    }

    if (port === 'elements') {
      const markup = `<vf-listbox id="elements-list" aria-label="Choose an item"><div id="elements-one" data-vf-listbox-option value="one" aria-selected="true">One</div><div id="elements-disabled" data-vf-listbox-option value="disabled" aria-disabled="true">Disabled</div><div id="elements-three" data-vf-listbox-option value="three">Three</div><div id="elements-banana" data-vf-listbox-option value="banana">Banana</div></vf-listbox><vf-listbox id="elements-multi" selection-mode="multiple" aria-label="Choose several"><div id="elements-multi-one" data-vf-listbox-option value="one" aria-selected="true">One</div><div id="elements-multi-three" data-vf-listbox-option value="three">Three</div></vf-listbox>`;
      await writeFile(path.join(outDir, 'elements.html'), page(markup, '<script type="module" src="./elements.js"></script>'));
      await build({ stdin: { resolveDir: root, sourcefile: 'elements-listbox-client.ts', contents: `import{defineListboxElement}from'@vyrnforge/elements/listbox';defineListboxElement();` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'elements.js') });
    }
  },
};
