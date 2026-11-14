import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'context-menu',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/context-menu');
    await mkdir(dir, { recursive: true });
    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/context-menu.css";',
        resolveDir: root,
        sourcefile: 'context-menu-public.css',
        loader: 'css',
      },
      bundle: true,
      outfile: path.join(dir, 'styles.css'),
    });

    const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Context menu browser fixture</title><link rel="stylesheet" href="./styles.css"></head><body><main><h1>Context menu browser fixture</h1><button id="before">Before</button>${body}<button id="after">After</button></main>${script}</body></html>`;
    const items = (prefix) => `<button id="${prefix}-open" type="button" role="menuitem" tabindex="-1" data-vf-context-menu-item>Open</button><button id="${prefix}-disabled" type="button" role="menuitem" tabindex="-1" aria-disabled="true" disabled data-vf-context-menu-item>Blueberry disabled</button><button id="${prefix}-rename" type="button" role="menuitem" tabindex="-1" data-vf-context-menu-item>Rename</button><button id="${prefix}-banana" type="button" role="menuitem" tabindex="-1" data-vf-context-menu-item>Banana</button>`;

    if (port === 'web') {
      const body = `<div id="target" tabindex="0" data-vf-context-menu-trigger>Context target</div><div id="menu" role="menu" tabindex="-1" aria-label="Context commands" hidden data-vf-context-menu-content>${items('web')}</div>`;
      const script = `<script>const target=document.querySelector('#target');const menu=document.querySelector('#menu');const all=()=>Array.from(menu.querySelectorAll('[data-vf-context-menu-item]'));const disabled=item=>item.disabled||item.getAttribute('aria-disabled')==='true';const enabled=()=>all().filter(item=>!disabled(item));const close=()=>{menu.hidden=true;target.focus()};target.oncontextmenu=e=>{e.preventDefault();menu.hidden=false;enabled()[0]?.focus()};menu.onkeydown=e=>{const list=all();const states=list.map(disabled);const current=list.indexOf(document.activeElement);const move=step=>{let i=current;for(let count=0;count<list.length;count++){i=(i+step+list.length)%list.length;if(!states[i]){list[i].focus();break}}};if(e.key==='Escape'){e.preventDefault();close();return}if(e.key==='ArrowDown'){e.preventDefault();move(1)}else if(e.key==='ArrowUp'){e.preventDefault();move(-1)}else if(e.key==='Home'){e.preventDefault();enabled()[0]?.focus()}else if(e.key==='End'){e.preventDefault();enabled().at(-1)?.focus()}else if(e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey){const q=e.key.toLocaleLowerCase();const ordered=[...list.slice(current+1),...list.slice(0,current+1)];const match=ordered.find(item=>!disabled(item)&&(item.textContent||'').trim().toLocaleLowerCase().startsWith(q));if(match){e.preventDefault();match.focus()}}};menu.onclick=e=>{const item=e.target.closest('[data-vf-context-menu-item]');if(item&&!disabled(item)){document.body.dataset.selected=item.id;close()}}</script>`;
      await writeFile(path.join(dir, 'web.html'), page(body, script));
    }

    if (port === 'react') {
      await writeFile(path.join(dir, 'react.html'), page('<div id="app"></div>', '<script type="module" src="./react.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'react-context-menu-client.ts',
          contents: `import{createElement}from'react';import{createRoot}from'react-dom/client';import{ContextMenuRoot,ContextMenuTrigger,ContextMenuContent,ContextMenuItem}from'@vyrnforge/react/context-menu';const item=(id,label,disabled=false)=>createElement(ContextMenuItem,{id,disabled,onSelect:()=>{document.body.dataset.selected=id}},label);createRoot(document.querySelector('#app')).render(createElement(ContextMenuRoot,null,createElement(ContextMenuTrigger,{id:'target',tabIndex:0},'Context target'),createElement(ContextMenuContent,{id:'menu','aria-label':'Context commands'},item('react-open','Open'),item('react-disabled','Blueberry disabled',true),item('react-rename','Rename'),item('react-banana','Banana'))));`,
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
          sourcefile: 'vue-context-menu-client.ts',
          contents: `import{createApp,h}from'vue';import{ContextMenuRoot,ContextMenuTrigger,ContextMenuContent,ContextMenuItem}from'@vyrnforge/vue/context-menu';const item=(id,label,disabled=false)=>h(ContextMenuItem,{id,disabled,onSelect:()=>{document.body.dataset.selected=id}},()=>label);createApp({render:()=>h(ContextMenuRoot,null,()=>[h(ContextMenuTrigger,{id:'target',tabindex:0},()=> 'Context target'),h(ContextMenuContent,{id:'menu','aria-label':'Context commands'},()=>[item('vue-open','Open'),item('vue-disabled','Blueberry disabled',true),item('vue-rename','Rename'),item('vue-banana','Banana')])])}).mount('#app');`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'vue.js'),
      });
    }

    if (port === 'angular') {
      await writeFile(path.join(dir, 'angular.html'), page('<vf-context-menu-test></vf-context-menu-test>', '<script type="module" src="./angular.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'angular-context-menu-client.ts',
          contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{VfContextMenuRootDirective,VfContextMenuTriggerDirective,VfContextMenuContentDirective,VfContextMenuItemDirective}from'@vyrnforge/angular/context-menu';class App{open(){document.body.dataset.selected='angular-open'}rename(){document.body.dataset.selected='angular-rename'}banana(){document.body.dataset.selected='angular-banana'}}Component({selector:'vf-context-menu-test',standalone:true,imports:[VfContextMenuRootDirective,VfContextMenuTriggerDirective,VfContextMenuContentDirective,VfContextMenuItemDirective],template:'<div vfContextMenuRoot><div id="target" tabindex="0" vfContextMenuTrigger>Context target</div><div id="menu" vfContextMenuContent aria-label="Context commands"><button id="angular-open" vfContextMenuItem (selected)="open()">Open</button><button id="angular-disabled" vfContextMenuItem [disabled]="true">Blueberry disabled</button><button id="angular-rename" vfContextMenuItem (selected)="rename()">Rename</button><button id="angular-banana" vfContextMenuItem (selected)="banana()">Banana</button></div></div>'})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'angular.js'),
      });
    }

    if (port === 'elements') {
      const body = `<vf-context-menu><div id="target" tabindex="0" data-vf-context-menu-trigger>Context target</div><div id="menu" aria-label="Context commands" data-vf-context-menu-content>${items('elements')}</div></vf-context-menu>`;
      await writeFile(path.join(dir, 'elements.html'), page(body, '<script type="module" src="./elements.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'elements-context-menu-client.ts',
          contents: `import{defineContextMenuElement}from'@vyrnforge/elements/context-menu';defineContextMenuElement();document.querySelectorAll('[data-vf-context-menu-item]').forEach(item=>item.addEventListener('click',()=>{if(!item.hasAttribute('disabled'))document.body.dataset.selected=item.id}));`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'elements.js'),
      });
    }
  },
};
