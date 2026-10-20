import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2] || 'web';
const root = process.cwd();
const outDir = path.join(root, 'dist/docs/next/dialog-fixtures');
await mkdir(outDir, { recursive: true });

const dialogCss = await readFile(path.join(root, 'packages/web/dist/components/dialog/dialog.css'), 'utf8');
const tokenCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
await writeFile(path.join(outDir, 'dialog.css'), `${tokenCss}\n${dialogCss.replace('@import "../../styles/tokens.css";', '')}`);
const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./dialog.css"><title>Dialog fixture</title></head><body><main><h1>Dialog browser fixture</h1>${body}</main>${script}</body></html>`;

if (port === 'web') {
  await writeFile(path.join(outDir, 'web.html'), page(`
    <dialog id="web-dialog" open data-vf-dialog-root data-vf-open aria-labelledby="web-dialog-title" aria-describedby="web-dialog-description">
      <h2 id="web-dialog-title" data-vf-dialog-title>Example dialog</h2>
      <p id="web-dialog-description" data-vf-dialog-description>Dialog description</p>
      <div data-vf-dialog-body>Body</div>
      <button type="button" data-vf-dialog-close>Close</button>
    </dialog>`));
}

if (port === 'react') {
  const React = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { DialogRoot, DialogTitle, DialogDescription, DialogBody, DialogClose } = await import('@vyrnforge/react/dialog');
  function App() {
    const [open, setOpen] = React.useState(false);
    const [parentOpen, setParentOpen] = React.useState(false);
    const [childOpen, setChildOpen] = React.useState(false);
    const initialRef = React.useRef(null);
    return React.createElement(React.Fragment, null,
      React.createElement('button', { id: 'react-open', type: 'button', onClick: () => setOpen(true) }, 'Open dialog'),
      React.createElement(DialogRoot, { id: 'react-dialog', open, onOpenChange: setOpen, backdropDismiss: true, descriptionId: 'react-dialog-description', initialFocusRef: initialRef, onDismissRequest: (request) => { if (typeof document !== 'undefined') document.body.dataset.dismissReason = request.reason; } },
        React.createElement(DialogTitle, null, 'Edit profile'),
        React.createElement(DialogDescription, { id: 'react-dialog-description' }, 'Update your profile.'),
        React.createElement(DialogBody, null, React.createElement('input', { id: 'react-initial', ref: initialRef, 'aria-label': 'Profile name' })),
        React.createElement(DialogClose, { id: 'react-close' }, 'Close')),
      React.createElement('button', { id: 'react-parent-open', type: 'button', onClick: () => setParentOpen(true) }, 'Open parent dialog'),
      React.createElement(DialogRoot, { id: 'react-parent-dialog', open: parentOpen, onOpenChange: setParentOpen },
        React.createElement(DialogTitle, null, 'Parent dialog'),
        React.createElement(DialogBody, null,
          React.createElement('button', { id: 'react-child-open', type: 'button', onClick: () => setChildOpen(true) }, 'Open child dialog'),
          React.createElement(DialogRoot, { id: 'react-child-dialog', open: childOpen, onOpenChange: setChildOpen },
            React.createElement(DialogTitle, null, 'Child dialog'),
            React.createElement(DialogBody, null, 'Child content')))))
    );
  }
  const markup = renderToString(React.createElement(App));
  await writeFile(path.join(outDir, 'react.html'), page(`<div id="react-root">${markup}</div>`, '<script type="module" src="./react.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'react-dialog-client.ts', contents: `import * as React from 'react';import{hydrateRoot}from'react-dom/client';import{DialogRoot,DialogTitle,DialogDescription,DialogBody,DialogClose}from'@vyrnforge/react/dialog';function App(){const[open,setOpen]=React.useState(false),[parentOpen,setParentOpen]=React.useState(false),[childOpen,setChildOpen]=React.useState(false);const initialRef=React.useRef(null);return React.createElement(React.Fragment,null,React.createElement('button',{id:'react-open',type:'button',onClick:()=>setOpen(true)},'Open dialog'),React.createElement(DialogRoot,{id:'react-dialog',open,onOpenChange:setOpen,backdropDismiss:true,descriptionId:'react-dialog-description',initialFocusRef:initialRef,onDismissRequest:r=>document.body.dataset.dismissReason=r.reason},React.createElement(DialogTitle,null,'Edit profile'),React.createElement(DialogDescription,{id:'react-dialog-description'},'Update your profile.'),React.createElement(DialogBody,null,React.createElement('input',{id:'react-initial',ref:initialRef,'aria-label':'Profile name'})),React.createElement(DialogClose,{id:'react-close'},'Close')),React.createElement('button',{id:'react-parent-open',type:'button',onClick:()=>setParentOpen(true)},'Open parent dialog'),React.createElement(DialogRoot,{id:'react-parent-dialog',open:parentOpen,onOpenChange:setParentOpen},React.createElement(DialogTitle,null,'Parent dialog'),React.createElement(DialogBody,null,React.createElement('button',{id:'react-child-open',type:'button',onClick:()=>setChildOpen(true)},'Open child dialog'),React.createElement(DialogRoot,{id:'react-child-dialog',open:childOpen,onOpenChange:setChildOpen},React.createElement(DialogTitle,null,'Child dialog'),React.createElement(DialogBody,null,'Child content')))))}hydrateRoot(document.querySelector('#react-root'),React.createElement(App));` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'react.js') });
}

if (port === 'vue') {
  const { createSSRApp, h, ref } = await import('vue');
  const { renderToString } = await import('@vue/server-renderer');
  const { DialogRoot, DialogTitle, DialogDescription, DialogBody, DialogClose } = await import('@vyrnforge/vue/dialog');
  const createApp = () => createSSRApp({
    setup() {
      const open = ref(false), parentOpen = ref(false), childOpen = ref(false);
      return () => h('div', [
        h('button', { id: 'vue-open', type: 'button', onClick: () => { open.value = true; } }, 'Open dialog'),
        h(DialogRoot, { id: 'vue-dialog', modelValue: open.value, 'onUpdate:modelValue': (value) => { open.value = value; }, backdropDismiss: true, descriptionId: 'vue-dialog-description', initialFocus: () => document.querySelector('#vue-initial'), onDismissRequest: (request) => { if (typeof document !== 'undefined') document.body.dataset.dismissReason = request.reason; } }, () => [
          h(DialogTitle, {}, () => 'Edit profile'), h(DialogDescription, { id: 'vue-dialog-description' }, () => 'Update your profile.'), h(DialogBody, {}, () => h('input', { id: 'vue-initial', 'aria-label': 'Profile name' })), h(DialogClose, { id: 'vue-close' }, () => 'Close')]),
        h('button', { id: 'vue-parent-open', type: 'button', onClick: () => { parentOpen.value = true; } }, 'Open parent dialog'),
        h(DialogRoot, { id: 'vue-parent-dialog', modelValue: parentOpen.value, 'onUpdate:modelValue': (value) => { parentOpen.value = value; } }, () => [
          h(DialogTitle, {}, () => 'Parent dialog'),
          h(DialogBody, {}, () => [
            h('button', { id: 'vue-child-open', type: 'button', onClick: () => { childOpen.value = true; } }, 'Open child dialog'),
            h(DialogRoot, { id: 'vue-child-dialog', modelValue: childOpen.value, 'onUpdate:modelValue': (value) => { childOpen.value = value; } }, () => [h(DialogTitle, {}, () => 'Child dialog'), h(DialogBody, {}, () => 'Child content')]),
          ]),
        ]),
      ]);
    },
  });
  const markup = await renderToString(createApp());
  await writeFile(path.join(outDir, 'vue.html'), page(`<div id="vue-root">${markup}</div>`, '<script type="module" src="./vue.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'vue-dialog-client.ts', contents: `import{createSSRApp,h,ref}from'vue';import{DialogRoot,DialogTitle,DialogDescription,DialogBody,DialogClose}from'@vyrnforge/vue/dialog';const app=createSSRApp({setup(){const open=ref(false),parentOpen=ref(false),childOpen=ref(false);return()=>h('div',[h('button',{id:'vue-open',type:'button',onClick:()=>open.value=true},'Open dialog'),h(DialogRoot,{id:'vue-dialog',modelValue:open.value,'onUpdate:modelValue':v=>open.value=v,backdropDismiss:true,descriptionId:'vue-dialog-description',initialFocus:()=>document.querySelector('#vue-initial'),onDismissRequest:r=>document.body.dataset.dismissReason=r.reason},()=>[h(DialogTitle,{},()=> 'Edit profile'),h(DialogDescription,{id:'vue-dialog-description'},()=> 'Update your profile.'),h(DialogBody,{},()=>h('input',{id:'vue-initial','aria-label':'Profile name'})),h(DialogClose,{id:'vue-close'},()=> 'Close')]),h('button',{id:'vue-parent-open',type:'button',onClick:()=>parentOpen.value=true},'Open parent dialog'),h(DialogRoot,{id:'vue-parent-dialog',modelValue:parentOpen.value,'onUpdate:modelValue':v=>parentOpen.value=v},()=>[h(DialogTitle,{},()=> 'Parent dialog'),h(DialogBody,{},()=>[h('button',{id:'vue-child-open',type:'button',onClick:()=>childOpen.value=true},'Open child dialog'),h(DialogRoot,{id:'vue-child-dialog',modelValue:childOpen.value,'onUpdate:modelValue':v=>childOpen.value=v},()=>[h(DialogTitle,{},()=> 'Child dialog'),h(DialogBody,{},()=> 'Child content')])])])])}});app.mount('#vue-root');` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'vue.js') });
}

if (port === 'angular') {
  await import('@angular/compiler');
  const { Component, provideZonelessChangeDetection, signal } = await import('@angular/core');
  const { bootstrapApplication, provideClientHydration } = await import('@angular/platform-browser');
  const { renderApplication } = await import('@angular/platform-server');
  const { VfDialogRootDirective, VfDialogTitleDirective, VfDialogDescriptionDirective, VfDialogBodyDirective, VfDialogCloseDirective } = await import('@vyrnforge/angular/dialog');
  const template = '<button id="angular-open" type="button" (click)="open.set(true)">Open dialog</button><dialog vfDialogRoot id="angular-dialog" [open]="open()" (openChange)="open.set($event)" (dismissRequest)="dismissed($event)" backdropDismiss descriptionId="angular-dialog-description"><h2 vfDialogTitle>Edit profile</h2><p vfDialogDescription id="angular-dialog-description">Update your profile.</p><div vfDialogBody><input id="angular-initial" aria-label="Profile name"></div><button id="angular-close" vfDialogClose>Close</button></dialog><button id="angular-parent-open" type="button" (click)="parentOpen.set(true)">Open parent dialog</button><dialog vfDialogRoot id="angular-parent-dialog" [open]="parentOpen()" (openChange)="parentOpen.set($event)"><h2 vfDialogTitle>Parent dialog</h2><div vfDialogBody><button id="angular-child-open" type="button" (click)="childOpen.set(true)">Open child dialog</button><dialog vfDialogRoot id="angular-child-dialog" [open]="childOpen()" (openChange)="childOpen.set($event)"><h2 vfDialogTitle>Child dialog</h2><div vfDialogBody>Child content</div></dialog></div></dialog>';
  class DialogTestApp { open = signal(false); parentOpen = signal(false); childOpen = signal(false); dismissed(_request) {} }
  Component({ selector: 'vf-dialog-test', standalone: true, imports: [VfDialogRootDirective, VfDialogTitleDirective, VfDialogDescriptionDirective, VfDialogBodyDirective, VfDialogCloseDirective], template })(DialogTestApp);
  const html = await renderApplication((context) => bootstrapApplication(DialogTestApp, { providers: [provideZonelessChangeDetection(), provideClientHydration()] }, context), { document: '<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./dialog.css"></head><body><vf-dialog-test></vf-dialog-test></body></html>' });
  await writeFile(path.join(outDir, 'angular.html'), html.replace('</body>', '<script type="module" src="./angular.js"></script></body>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'angular-dialog-client.ts', contents: `import '@angular/compiler';import{Component,provideZonelessChangeDetection,signal}from'@angular/core';import{bootstrapApplication,provideClientHydration}from'@angular/platform-browser';import{VfDialogRootDirective,VfDialogTitleDirective,VfDialogDescriptionDirective,VfDialogBodyDirective,VfDialogCloseDirective}from'@vyrnforge/angular/dialog';class App{open=signal(false);parentOpen=signal(false);childOpen=signal(false);dismissed(request){document.body.dataset.dismissReason=request.reason}}Component({selector:'vf-dialog-test',standalone:true,imports:[VfDialogRootDirective,VfDialogTitleDirective,VfDialogDescriptionDirective,VfDialogBodyDirective,VfDialogCloseDirective],template:${JSON.stringify(template)}})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection(),provideClientHydration()]});` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'angular.js') });
}
