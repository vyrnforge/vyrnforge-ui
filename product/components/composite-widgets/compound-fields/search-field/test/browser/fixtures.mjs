import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'search-field',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/search-field');
    await mkdir(dir, { recursive: true });

    const page = (body, script = '', head = '') =>
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Search field browser fixture</title>${head}</head><body><main><h1>Search field browser fixture</h1>${body}</main>${script}</body></html>`;

    if (port === 'web') {
      await writeFile(
        path.join(dir, 'web.html'),
        page(
          '<form id="search-form"><div role="search" data-vf-search-field-root><input id="search" name="query" type="search" aria-label="Search" value="forge" data-vf-search-field-input><button id="clear" type="button" data-vf-search-field-clear>Clear query</button></div><button type="reset">Reset search</button></form>',
          '<script>clear.onclick=()=>{search.value="";search.focus();search.dispatchEvent(new Event("input",{bubbles:true}))};</script>',
        ),
      );
    }

    if (port === 'react') {
      await writeFile(
        path.join(dir, 'react.html'),
        page(
          '<div id="app"></div>',
          '<script type="module" src="./react.js"></script>',
          '<link rel="stylesheet" href="./react.css">',
        ),
      );
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'react-search-field-client.ts',
          contents: `import{createElement,useState}from'react';import{createRoot}from'react-dom/client';import{SearchFieldRoot,SearchFieldInput,SearchFieldClear}from'@vyrnforge/react/search-field';import'@vyrnforge/web/styles/tokens.css';import'@vyrnforge/web/styles/search-field.css';const h=createElement;function App(){const [controlled,setControlled]=useState('committed');const record=(v)=>document.body.setAttribute('data-requested',v);return h('div',null,h('form',{id:'search-form'},h(SearchFieldRoot,{defaultValue:'forge',onValueChange:record},h(SearchFieldInput,{id:'search',name:'query','aria-label':'Search'}),h(SearchFieldClear,{id:'clear'},'Clear query')),h('button',{type:'reset'},'Reset search')),h('form',{id:'controlled-form'},h(SearchFieldRoot,{value:controlled,onValueChange:record},h(SearchFieldInput,{id:'controlled',name:'query','aria-label':'Controlled search'}),h(SearchFieldClear,{id:'controlled-clear'},'Clear controlled query')),h('button',{type:'button',id:'update-controlled',onClick:()=>setControlled('latest')},'Update'),h('button',{type:'reset'},'Reset controlled')))}createRoot(document.querySelector('#app')).render(h(App));`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'react.js'),
      });
      const entry = path.join(
        root,
        'product/components/composite-widgets/compound-fields/search-field/examples/data-explorer/react.tsx',
      );
      await build({
        entryPoints: [entry],
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outdir: dir,
        entryNames: 'data-explorer-react',
      });
      await writeFile(
        path.join(dir, 'data-explorer-react.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Search data explorer fixture</title><link rel="stylesheet" href="./data-explorer-react.css"><style>html,body{margin:0;min-block-size:100%;padding:1rem}</style></head><body><div id="root"></div><script type="module" src="./data-explorer-react.js"></script></body></html>',
      );
    }

    if (port === 'vue') {
      await writeFile(
        path.join(dir, 'vue.html'),
        page('<div id="app"></div>', '<script type="module" src="./vue.js"></script>'),
      );
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'vue-search-field-client.ts',
          contents: `import{createApp,h,ref}from'vue';import{SearchFieldRoot,SearchFieldInput,SearchFieldClear}from'@vyrnforge/vue/search-field';createApp({setup(){const controlled=ref('committed');const record=(v)=>document.body.setAttribute('data-requested',v);return()=>h('div',null,[h('form',{id:'search-form'},[h(SearchFieldRoot,{defaultValue:'forge','onUpdate:value':record},()=>[h(SearchFieldInput,{id:'search',name:'query','aria-label':'Search'}),h(SearchFieldClear,{id:'clear'},()=> 'Clear query')]),h('button',{type:'reset'},'Reset search')]),h('form',{id:'controlled-form'},[h(SearchFieldRoot,{value:controlled.value,'onUpdate:value':record},()=>[h(SearchFieldInput,{id:'controlled',name:'query','aria-label':'Controlled search'}),h(SearchFieldClear,{id:'controlled-clear'},()=> 'Clear controlled query')]),h('button',{type:'button',id:'update-controlled',onClick:()=>controlled.value='latest'},'Update'),h('button',{type:'reset'},'Reset controlled')])])}}).mount('#app');`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'vue.js'),
      });
    }

    if (port === 'angular') {
      await writeFile(
        path.join(dir, 'angular.html'),
        page('<vf-search-field-test></vf-search-field-test>', '<script type="module" src="./angular.js"></script>'),
      );
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'angular-search-field-client.ts',
          contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{VfSearchFieldRootDirective,VfSearchFieldInputDirective,VfSearchFieldClearDirective}from'@vyrnforge/angular/search-field';class App{controlled='committed';record(v){document.body.setAttribute('data-requested',v)}}Component({selector:'vf-search-field-test',standalone:true,imports:[VfSearchFieldRootDirective,VfSearchFieldInputDirective,VfSearchFieldClearDirective],template:'<form id="search-form"><div vfSearchFieldRoot defaultValue="forge" (valueChange)="record($event)"><input id="search" name="query" vfSearchFieldInput aria-label="Search"><button id="clear" vfSearchFieldClear>Clear query</button></div><button type="reset">Reset search</button></form><form id="controlled-form"><div vfSearchFieldRoot [value]="controlled" (valueChange)="record($event)"><input id="controlled" name="query" vfSearchFieldInput aria-label="Controlled search"><button id="controlled-clear" vfSearchFieldClear>Clear controlled query</button></div><button type="button" id="update-controlled" (click)="controlled=\'latest\'">Update</button><button type="reset">Reset controlled</button></form>'})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'angular.js'),
      });
    }

    if (port === 'elements') {
      await writeFile(
        path.join(dir, 'elements.html'),
        page(
          '<form id="search-form"><vf-search-field><input id="search" name="query" type="search" aria-label="Search" value="forge" data-vf-search-field-input><button id="clear" type="button" data-vf-search-field-clear>Clear query</button></vf-search-field><button type="reset">Reset search</button></form>',
          '<script type="module" src="./elements.js"></script>',
        ),
      );
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'elements-search-field-client.ts',
          contents: `import{defineSearchFieldElement}from'@vyrnforge/elements/search-field';defineSearchFieldElement();`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'elements.js'),
      });
    }
  },
};
