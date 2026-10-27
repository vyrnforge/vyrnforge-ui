import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2] || 'web';
const root = process.cwd();
const dir = path.join(root, 'dist/docs/next/menu-fixtures');
await mkdir(dir, { recursive: true });

const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Menu fixture</title></head><body><main><h1>Menu browser fixture</h1><button id="before">Before</button>${body}<button id="after">After</button></main>${script}</body></html>`;

if (port === 'web') {
  const markup = `<button id="web-trigger" type="button" data-vf-menu-trigger aria-haspopup="menu" aria-expanded="true">Actions</button><div id="web-menu" role="menu" tabindex="-1" aria-label="Actions" data-vf-menu-content><button id="web-edit" type="button" role="menuitem" tabindex="-1" data-vf-menu-item>Edit</button><button id="web-locked" type="button" role="menuitem" tabindex="-1" aria-disabled="true" data-vf-menu-item>Locked</button><button id="web-duplicate" type="button" role="menuitem" tabindex="-1" data-vf-menu-item>Duplicate</button><button id="web-archive" type="button" role="menuitem" tabindex="-1" data-vf-menu-item>Archive</button></div>`;
  await writeFile(path.join(dir, 'web.html'), page(markup));
}

if (port === 'react') {
  await writeFile(path.join(dir, 'react.html'), page('<div id="app"></div>', '<script type="module" src="./react.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'react-menu-client.ts', contents: `import{createElement}from'react';import{createRoot}from'react-dom/client';import{MenuRoot,MenuTrigger,MenuContent,MenuItem}from'@vyrnforge/react/menu';const item=(id,label,disabled=false)=>createElement(MenuItem,{id,disabled,onClick:disabled?()=>{document.body.dataset.disabledClicked=id}:undefined,onSelect:()=>document.body.dataset.selected=id},label);createRoot(document.querySelector('#app')).render(createElement(MenuRoot,null,createElement(MenuTrigger,{id:'react-trigger'},'Actions'),createElement(MenuContent,{id:'react-menu','aria-label':'Actions'},item('react-edit','Edit'),item('react-locked','Locked',true),item('react-duplicate','Duplicate'),item('react-archive','Archive'))));` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(dir, 'react.js') });
}

if (port === 'vue') {
  await writeFile(path.join(dir, 'vue.html'), page('<div id="app"></div>', '<script type="module" src="./vue.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'vue-menu-client.ts', contents: `import{createApp,h}from'vue';import{MenuRoot,MenuTrigger,MenuContent,MenuItem}from'@vyrnforge/vue/menu';const item=(id,label,disabled=false)=>h(MenuItem,{id,disabled,onClick:disabled?()=>{document.body.dataset.disabledClicked=id}:undefined,onSelect:()=>document.body.dataset.selected=id},()=>label);createApp({render:()=>h(MenuRoot,null,()=>[h(MenuTrigger,{id:'vue-trigger'},()=> 'Actions'),h(MenuContent,{id:'vue-menu','aria-label':'Actions'},()=>[item('vue-edit','Edit'),item('vue-locked','Locked',true),item('vue-duplicate','Duplicate'),item('vue-archive','Archive')])])}).mount('#app');` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(dir, 'vue.js') });
}

if (port === 'angular') {
  const angularTemplate = `<div vfMenuRoot><button vfMenuTrigger id="angular-trigger">Actions</button><div vfMenuContent id="angular-menu" aria-label="Actions"><button vfMenuItem id="angular-edit" (selected)="selected('angular-edit')">Edit</button><button vfMenuItem id="angular-locked" [disabled]="true" (selected)="selected('angular-locked')">Locked</button><button vfMenuItem id="angular-duplicate" (selected)="selected('angular-duplicate')">Duplicate</button><button vfMenuItem id="angular-archive" (selected)="selected('angular-archive')">Archive</button></div></div>`;
  await writeFile(path.join(dir, 'angular.html'), page('<vf-menu-test></vf-menu-test>', '<script type="module" src="./angular.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'angular-menu-client.ts', contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{VfMenuRootDirective,VfMenuTriggerDirective,VfMenuContentDirective,VfMenuItemDirective}from'@vyrnforge/angular/menu';class App{selected(id){document.body.dataset.selected=id}}Component({selector:'vf-menu-test',standalone:true,imports:[VfMenuRootDirective,VfMenuTriggerDirective,VfMenuContentDirective,VfMenuItemDirective],template:${JSON.stringify(angularTemplate)}})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(dir, 'angular.js') });
}

if (port === 'elements') {
  const markup = `<vf-menu><button id="elements-trigger" type="button" data-vf-menu-trigger>Actions</button><div id="elements-menu" data-vf-menu-content aria-label="Actions"><button id="elements-edit" type="button" data-vf-menu-item>Edit</button><button id="elements-locked" type="button" data-vf-menu-item aria-disabled="true">Locked</button><button id="elements-duplicate" type="button" data-vf-menu-item>Duplicate</button><button id="elements-archive" type="button" data-vf-menu-item>Archive</button></div></vf-menu>`;
  await writeFile(path.join(dir, 'elements.html'), page(markup, '<script type="module" src="./elements.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'elements-menu-client.ts', contents: `import{defineMenuElement}from'@vyrnforge/elements/menu';defineMenuElement();document.querySelector('vf-menu').addEventListener('vf-select',(event)=>{document.body.dataset.selected=event.detail.item.id});` }, bundle:true,format:'esm',platform:'browser',outfile:path.join(dir,'elements.js') });
}
