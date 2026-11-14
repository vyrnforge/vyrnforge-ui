import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'multi-select',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/multi-select');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/multi-select.css";',
        resolveDir: root,
        sourcefile: 'multi-select-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });

    const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Multi-select browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Multi-select browser fixture</h1><button id="before">Before</button><p id="multi-select-label">Choose items</p>${body}<button id="after">After</button></main>${script}</body></html>`;
    const options = (prefix) => `<button id="${prefix}-one" type="button" role="option" tabindex="-1" aria-selected="true" data-vf-multi-select-option data-vf-value="one">One</button><button id="${prefix}-disabled" type="button" role="option" tabindex="-1" aria-selected="false" aria-disabled="true" disabled data-vf-multi-select-option data-vf-value="disabled">Disabled</button><button id="${prefix}-three" type="button" role="option" tabindex="-1" aria-selected="false" data-vf-multi-select-option data-vf-value="three">Three</button><button id="${prefix}-banana" type="button" role="option" tabindex="-1" aria-selected="false" data-vf-multi-select-option data-vf-value="banana">Banana</button>`;

    if (port === 'web') {
      const body = `<button id="trigger" type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="list" data-vf-multi-select-trigger>Choose</button><div id="list" role="listbox" tabindex="-1" aria-multiselectable="true" aria-labelledby="multi-select-label" hidden data-vf-multi-select-content>${options('web')}</div>`;
      const script = `<script>const trigger=document.querySelector('#trigger');const list=document.querySelector('#list');trigger.onclick=()=>{const open=list.hidden;list.hidden=!open;trigger.setAttribute('aria-expanded',String(open))};list.querySelectorAll('[data-vf-multi-select-option]').forEach(option=>option.onclick=()=>option.setAttribute('aria-selected',String(option.getAttribute('aria-selected')!=='true')))</script>`;
      await writeFile(path.join(dir, 'web.html'), page(body, script));
    }

    if (port === 'react') {
      await writeFile(path.join(dir, 'react.html'), page('<div id="app"></div>', '<script type="module" src="./react.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'react-multi-select-client.ts',
          contents: `import{createElement}from'react';import{createRoot}from'react-dom/client';import{MultiSelectRoot,MultiSelectTrigger,MultiSelectContent,MultiSelectOption}from'@vyrnforge/react/multi-select';const option=(id,value,label,disabled=false)=>createElement(MultiSelectOption,{id,value,disabled},label);createRoot(document.querySelector('#app')).render(createElement(MultiSelectRoot,{defaultValue:['one'],onValueChange:values=>{document.body.dataset.values=values.join(',')}},createElement(MultiSelectTrigger,{id:'trigger','aria-controls':'list'},'Choose'),createElement(MultiSelectContent,{id:'list','aria-labelledby':'multi-select-label'},option('react-one','one','One'),option('react-disabled','disabled','Disabled',true),option('react-three','three','Three'),option('react-banana','banana','Banana'))));`,
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
          sourcefile: 'vue-multi-select-client.ts',
          contents: `import{createApp,h}from'vue';import{MultiSelectRoot,MultiSelectTrigger,MultiSelectContent,MultiSelectOption}from'@vyrnforge/vue/multi-select';const option=(id,value,label,disabled=false)=>h(MultiSelectOption,{id,value,disabled},()=>label);createApp({render:()=>h(MultiSelectRoot,{defaultValue:['one'],'onUpdate:value':values=>{document.body.dataset.values=values.join(',')}},()=>[h(MultiSelectTrigger,{id:'trigger','aria-controls':'list'},()=> 'Choose'),h(MultiSelectContent,{id:'list','aria-labelledby':'multi-select-label'},()=>[option('vue-one','one','One'),option('vue-disabled','disabled','Disabled',true),option('vue-three','three','Three'),option('vue-banana','banana','Banana')])])}).mount('#app');`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'vue.js'),
      });
    }

    if (port === 'angular') {
      await writeFile(path.join(dir, 'angular.html'), page('<vf-multi-select-test></vf-multi-select-test>', '<script type="module" src="./angular.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'angular-multi-select-client.ts',
          contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{VfMultiSelectRootDirective,VfMultiSelectTriggerDirective,VfMultiSelectContentDirective,VfMultiSelectOptionDirective}from'@vyrnforge/angular/multi-select';class App{values=['one'];changed(values){document.body.dataset.values=values.join(',')}}Component({selector:'vf-multi-select-test',standalone:true,imports:[VfMultiSelectRootDirective,VfMultiSelectTriggerDirective,VfMultiSelectContentDirective,VfMultiSelectOptionDirective],template:'<div vfMultiSelectRoot [defaultValue]="values" (valueChange)="changed($event)"><button id="trigger" vfMultiSelectTrigger aria-controls="list">Choose</button><div id="list" vfMultiSelectContent aria-labelledby="multi-select-label"><button id="angular-one" vfMultiSelectOption="one">One</button><button id="angular-disabled" vfMultiSelectOption="disabled" [disabled]="true">Disabled</button><button id="angular-three" vfMultiSelectOption="three">Three</button><button id="angular-banana" vfMultiSelectOption="banana">Banana</button></div></div>'})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'angular.js'),
      });
    }

    if (port === 'elements') {
      const body = `<vf-multi-select id="elements-multi-select"><button id="trigger" type="button" aria-controls="list" data-vf-multi-select-trigger>Choose</button><div id="list" aria-labelledby="multi-select-label" data-vf-multi-select-content><button id="elements-one" type="button" aria-selected="true" data-vf-multi-select-option data-vf-value="one">One</button><button id="elements-disabled" type="button" disabled aria-selected="false" data-vf-multi-select-option data-vf-value="disabled">Disabled</button><button id="elements-three" type="button" aria-selected="false" data-vf-multi-select-option data-vf-value="three">Three</button><button id="elements-banana" type="button" aria-selected="false" data-vf-multi-select-option data-vf-value="banana">Banana</button></div></vf-multi-select>`;
      await writeFile(path.join(dir, 'elements.html'), page(body, '<script type="module" src="./elements.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'elements-multi-select-client.ts',
          contents: `import{defineMultiSelectElement}from'@vyrnforge/elements/multi-select';defineMultiSelectElement();`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'elements.js'),
      });
    }
  },
};
