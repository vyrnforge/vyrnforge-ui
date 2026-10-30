import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'select',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/select');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/select.css";',
        resolveDir: root,
        sourcefile: 'select-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });

    const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Select browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Select browser fixture</h1><button id="before">Before</button><div id="select-label">Choose an option</div>${body}<button id="after">After</button></main>${script}</body></html>`;
    const staticOptions = (prefix) => `<button id="${prefix}-one" type="button" role="option" tabindex="-1" aria-selected="true" data-vf-select-option data-vf-value="one">One</button><button id="${prefix}-disabled" type="button" role="option" tabindex="-1" aria-selected="false" aria-disabled="true" disabled data-vf-select-option data-vf-value="disabled">Disabled</button><button id="${prefix}-three" type="button" role="option" tabindex="-1" aria-selected="false" data-vf-select-option data-vf-value="three">Three</button><button id="${prefix}-banana" type="button" role="option" tabindex="-1" aria-selected="false" data-vf-select-option data-vf-value="banana">Banana</button>`;

    if (port === 'web') {
      const body = `<button id="trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="list" data-vf-select-trigger>One</button><div id="list" role="listbox" tabindex="-1" aria-labelledby="select-label" hidden data-vf-select-content>${staticOptions('web')}</div>`;
      const script = `<script>const trigger=document.querySelector('#trigger');const list=document.querySelector('#list');const options=[...list.querySelectorAll('[data-vf-select-option]')];trigger.onclick=()=>{list.hidden=false;trigger.setAttribute('aria-expanded','true')};options.forEach(option=>option.onclick=()=>{options.forEach(item=>item.setAttribute('aria-selected','false'));option.setAttribute('aria-selected','true');list.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.focus()})</script>`;
      await writeFile(path.join(dir, 'web.html'), page(body, script));
    }

    if (port === 'react') {
      await writeFile(path.join(dir, 'react.html'), page('<div id="app"></div>', '<script type="module" src="./react.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'react-select-client.ts',
          contents: `import{createElement}from'react';import{createRoot}from'react-dom/client';import{SelectRoot,SelectTrigger,SelectContent,SelectOption}from'@vyrnforge/react/select';const option=(id,value,label,disabled=false)=>createElement(SelectOption,{id,value,disabled},label);createRoot(document.querySelector('#app')).render(createElement(SelectRoot,{defaultValue:'one',onValueChange:value=>{document.body.dataset.value=value}},createElement(SelectTrigger,{id:'trigger','aria-controls':'list'},'Choose'),createElement(SelectContent,{id:'list','aria-labelledby':'select-label'},option('react-one','one','One'),option('react-disabled','disabled','Disabled',true),option('react-three','three','Three'),option('react-banana','banana','Banana'))));`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'react.js'),
      });
    }

    if (port === 'vue') {
      await writeFile(path.join(dir, 'vue.html'), page('<div id="app"></div>', '<script type="module" src="./vue.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'vue-select-client.ts',
          contents: `import{createApp,h}from'vue';import{SelectRoot,SelectTrigger,SelectContent,SelectOption}from'@vyrnforge/vue/select';const option=(id,value,label,disabled=false)=>h(SelectOption,{id,value,disabled},()=>label);createApp({render:()=>h(SelectRoot,{defaultValue:'one','onUpdate:value':value=>{document.body.dataset.value=value}},()=>[h(SelectTrigger,{id:'trigger','aria-controls':'list'},()=> 'Choose'),h(SelectContent,{id:'list','aria-labelledby':'select-label'},()=>[option('vue-one','one','One'),option('vue-disabled','disabled','Disabled',true),option('vue-three','three','Three'),option('vue-banana','banana','Banana')])])}).mount('#app');`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'vue.js'),
      });
    }

    if (port === 'angular') {
      await writeFile(path.join(dir, 'angular.html'), page('<vf-select-test></vf-select-test>', '<script type="module" src="./angular.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'angular-select-client.ts',
          contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{VfSelectRootDirective,VfSelectTriggerDirective,VfSelectContentDirective,VfSelectOptionDirective}from'@vyrnforge/angular/select';class App{changed(value){document.body.dataset.value=value}}Component({selector:'vf-select-test',standalone:true,imports:[VfSelectRootDirective,VfSelectTriggerDirective,VfSelectContentDirective,VfSelectOptionDirective],template:'<div vfSelectRoot defaultValue="one" (valueChange)="changed($event)"><button id="trigger" vfSelectTrigger aria-controls="list">Choose</button><div id="list" vfSelectContent aria-labelledby="select-label"><button id="angular-one" vfSelectOption="one">One</button><button id="angular-disabled" vfSelectOption="disabled" [disabled]="true">Disabled</button><button id="angular-three" vfSelectOption="three">Three</button><button id="angular-banana" vfSelectOption="banana">Banana</button></div></div>'})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'angular.js'),
      });
    }

    if (port === 'elements') {
      const body = `<vf-select id="elements-select" value="one"><button id="trigger" type="button" aria-controls="list" data-vf-select-trigger>Choose</button><div id="list" aria-labelledby="select-label" data-vf-select-content><button id="elements-one" type="button" data-vf-select-option data-vf-value="one">One</button><button id="elements-disabled" type="button" disabled data-vf-select-option data-vf-value="disabled">Disabled</button><button id="elements-three" type="button" data-vf-select-option data-vf-value="three">Three</button><button id="elements-banana" type="button" data-vf-select-option data-vf-value="banana">Banana</button></div></vf-select>`;
      await writeFile(path.join(dir, 'elements.html'), page(body, '<script type="module" src="./elements.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'elements-select-client.ts',
          contents: `import{defineSelectElement}from'@vyrnforge/elements/select';defineSelectElement();`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'elements.js'),
      });
    }
  },
};
