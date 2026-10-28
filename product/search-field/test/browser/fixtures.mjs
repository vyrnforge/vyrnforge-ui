import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2] || 'web';
const root = process.cwd();
const dir = path.join(root, 'dist/browser-fixtures/components/search-field');
await mkdir(dir, { recursive: true });

const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Search field browser fixture</title></head><body><main><h1>Search field browser fixture</h1>${body}</main>${script}</body></html>`;

if (port === 'web') {
  await writeFile(path.join(dir, 'web.html'), page('<div role="search" data-vf-search-field-root><input id="search" type="search" aria-label="Search" value="forge" data-vf-search-field-input><button id="clear" type="button" data-vf-search-field-clear>Clear query</button></div>', '<script>clear.onclick=()=>{search.value="";search.focus();search.dispatchEvent(new Event("input",{bubbles:true}))};</script>'));
}

if (port === 'react') {
  await writeFile(path.join(dir, 'react.html'), page('<div id="app"></div>', '<script type="module" src="./react.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'react-search-field-client.ts', contents: `import{createElement}from'react';import{createRoot}from'react-dom/client';import{SearchFieldRoot,SearchFieldInput,SearchFieldClear}from'@vyrnforge/react/search-field';createRoot(document.querySelector('#app')).render(createElement(SearchFieldRoot,{defaultValue:'forge'},createElement(SearchFieldInput,{id:'search','aria-label':'Search'}),createElement(SearchFieldClear,{id:'clear'},'Clear query')));` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(dir, 'react.js') });
  const entry = path.join(root, 'product/search-field/examples/data-explorer/react.tsx');
  await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'browser', outdir: dir, entryNames: 'data-explorer-react' });
  await writeFile(path.join(dir, 'data-explorer-react.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Search data explorer fixture</title><link rel="stylesheet" href="./data-explorer-react.css"><style>html,body{margin:0;min-block-size:100%;padding:1rem}</style></head><body><div id="root"></div><script type="module" src="./data-explorer-react.js"></script></body></html>');
}

if (port === 'vue') {
  await writeFile(path.join(dir, 'vue.html'), page('<div id="app"></div>', '<script type="module" src="./vue.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'vue-search-field-client.ts', contents: `import{createApp,h}from'vue';import{SearchFieldRoot,SearchFieldInput,SearchFieldClear}from'@vyrnforge/vue/search-field';createApp({render:()=>h(SearchFieldRoot,{defaultValue:'forge'},()=>[h(SearchFieldInput,{id:'search','aria-label':'Search'}),h(SearchFieldClear,{id:'clear'},()=> 'Clear query')])}).mount('#app');` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(dir, 'vue.js') });
}

if (port === 'angular') {
  await writeFile(path.join(dir, 'angular.html'), page('<vf-search-field-test></vf-search-field-test>', '<script type="module" src="./angular.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'angular-search-field-client.ts', contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{VfSearchFieldRootDirective,VfSearchFieldInputDirective,VfSearchFieldClearDirective}from'@vyrnforge/angular/search-field';class App{}Component({selector:'vf-search-field-test',standalone:true,imports:[VfSearchFieldRootDirective,VfSearchFieldInputDirective,VfSearchFieldClearDirective],template:'<div vfSearchFieldRoot defaultValue="forge"><input id="search" vfSearchFieldInput aria-label="Search"><button id="clear" vfSearchFieldClear>Clear query</button></div>'})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(dir, 'angular.js') });
}

if (port === 'elements') {
  await writeFile(path.join(dir, 'elements.html'), page('<vf-search-field><input id="search" type="search" aria-label="Search" value="forge" data-vf-search-field-input><button id="clear" type="button" data-vf-search-field-clear>Clear query</button></vf-search-field>', '<script type="module" src="./elements.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'elements-search-field-client.ts', contents: `import{defineSearchFieldElement}from'@vyrnforge/elements/search-field';defineSearchFieldElement();` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(dir, 'elements.js') });
}
