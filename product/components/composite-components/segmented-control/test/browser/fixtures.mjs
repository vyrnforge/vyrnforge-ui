import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'segmented-control',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/segmented-control');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/segmented-control.css";',
        resolveDir: root,
        sourcefile: 'segmented-control-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });

    const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Segmented control browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Segmented control browser fixture</h1><button id="before">Before</button>${body}<button id="after">After</button></main>${script}</body></html>`;
    const staticItems = (prefix) => `<button id="${prefix}-list" type="button" role="radio" aria-checked="true" tabindex="0" data-vf-segmented-control-item data-vf-value="list">List</button><button id="${prefix}-disabled" type="button" role="radio" aria-checked="false" tabindex="-1" disabled data-vf-segmented-control-item data-vf-value="disabled">Disabled</button><button id="${prefix}-grid" type="button" role="radio" aria-checked="false" tabindex="-1" data-vf-segmented-control-item data-vf-value="grid">Grid</button><button id="${prefix}-details" type="button" role="radio" aria-checked="false" tabindex="-1" data-vf-segmented-control-item data-vf-value="details">Details</button>`;

    if (port === 'web') {
      await writeFile(path.join(dir, 'web.html'), page(`<div id="group" role="radiogroup" aria-label="View" data-vf-segmented-control-root>${staticItems('web')}</div>`));
    }

    if (port === 'react') {
      await writeFile(path.join(dir, 'react.html'), page('<div id="app"></div>', '<script type="module" src="./react.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'react-segmented-control-client.ts',
          contents: `import{createElement}from'react';import{createRoot}from'react-dom/client';import{SegmentedControlRoot,SegmentedControlItem}from'@vyrnforge/react/segmented-control';const item=(id,value,label,disabled=false)=>createElement(SegmentedControlItem,{id,value,disabled},label);createRoot(document.querySelector('#app')).render(createElement(SegmentedControlRoot,{id:'group','aria-label':'View',defaultValue:'list',onValueChange:value=>{document.body.dataset.value=value}},item('react-list','list','List'),item('react-disabled','disabled','Disabled',true),item('react-grid','grid','Grid'),item('react-details','details','Details')));`,
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
          sourcefile: 'vue-segmented-control-client.ts',
          contents: `import{createApp,h}from'vue';import{SegmentedControlRoot,SegmentedControlItem}from'@vyrnforge/vue/segmented-control';const item=(id,value,label,disabled=false)=>h(SegmentedControlItem,{id,value,disabled},()=>label);createApp({render:()=>h(SegmentedControlRoot,{id:'group','aria-label':'View',defaultValue:'list','onUpdate:value':value=>{document.body.dataset.value=value}},()=>[item('vue-list','list','List'),item('vue-disabled','disabled','Disabled',true),item('vue-grid','grid','Grid'),item('vue-details','details','Details')])}).mount('#app');`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'vue.js'),
      });
    }

    if (port === 'angular') {
      await writeFile(path.join(dir, 'angular.html'), page('<vf-segmented-control-test></vf-segmented-control-test>', '<script type="module" src="./angular.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'angular-segmented-control-client.ts',
          contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{VfSegmentedControlRootDirective,VfSegmentedControlItemDirective}from'@vyrnforge/angular/segmented-control';class App{value='list';changed(value){document.body.dataset.value=value}}Component({selector:'vf-segmented-control-test',standalone:true,imports:[VfSegmentedControlRootDirective,VfSegmentedControlItemDirective],template:'<div id="group" vfSegmentedControlRoot aria-label="View" [defaultValue]="value" (valueChange)="changed($event)"><button id="angular-list" vfSegmentedControlItem="list">List</button><button id="angular-disabled" vfSegmentedControlItem="disabled" [disabled]="true">Disabled</button><button id="angular-grid" vfSegmentedControlItem="grid">Grid</button><button id="angular-details" vfSegmentedControlItem="details">Details</button></div>'})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'angular.js'),
      });
    }

    if (port === 'elements') {
      const body = `<vf-segmented-control id="group" aria-label="View">${staticItems('elements')}</vf-segmented-control>`;
      await writeFile(path.join(dir, 'elements.html'), page(body, '<script type="module" src="./elements.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'elements-segmented-control-client.ts',
          contents: `import{defineSegmentedControlElement}from'@vyrnforge/elements/segmented-control';defineSegmentedControlElement();`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'elements.js'),
      });
    }
  },
};
