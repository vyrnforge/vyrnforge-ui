import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { prepareBrowserFixture } from '../../../../../../../tooling/testing/browser-fixtures.mjs';
const native = `<button id="trigger" type="button">Open Confirm changes</button><dialog id="modal" data-vf-dialog-root data-vf-alert-dialog-root role="alertdialog" aria-labelledby="modal-title" aria-describedby="modal-description"><h2 id="modal-title" data-vf-dialog-title>Confirm changes</h2><p id="modal-description" data-vf-dialog-description>Review the consequences before confirming.</p><button id="close" type="button" data-vf-dialog-close autofocus>Cancel</button></dialog>`;
const nativeScript = "const dialog=document.querySelector('#modal');document.querySelector('#trigger').addEventListener('click',()=>dialog.showModal());document.querySelector('#close').addEventListener('click',()=>dialog.close());";
const definition = {
  component: 'alert-dialog',
  title: 'AlertDialog fixture',
  heading: 'AlertDialog browser fixture',
  ports: {
    web: { body: native, script: nativeScript },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-alert-dialog-test' },
    elements: { story: 'createElementsStory' },
  },
};
function record(client, request) {
  if (client) document.body.dataset.dismissReason = request.reason;
}
function allow(client) { return !client || document.body.dataset.rejectClose !== 'true'; }
export async function createReactStory({ client }) {
  const { createElement: h, useState } = await import('react');
  const { AlertDialogRoot, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } = await import('@vyrnforge/react/alert-dialog');
  function App() {
    const [open, setOpen] = useState(false);
    return h('div', null,
      h('button', { id: 'trigger', type: 'button', onClick: () => setOpen(true) }, 'Open Confirm changes'),
      h(AlertDialogRoot, {id:'modal', open, descriptionId:'modal-description', onOpenChange: v => { if(allow(client)) setOpen(v); }, onDismissRequest: r => record(client, r)},
        h(AlertDialogTitle, null, 'Confirm changes'),
        h(AlertDialogDescription, null, 'Review the consequences before confirming.'),
        h(AlertDialogCancel, {id:'close', autoFocus:true}, 'Cancel'),
      ),
    );
  }
  return h(App);
}
export async function createVueStory({ client }) {
  const { createSSRApp, h, ref } = await import('vue');
  const { AlertDialogRoot, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel } = await import('@vyrnforge/vue/alert-dialog');
  return createSSRApp({ setup() {
    const open = ref(false);
    return () => h('div', null, [
      h('button', { id:'trigger', type:'button', onClick:()=>{open.value=true;} }, 'Open Confirm changes'),
      h(AlertDialogRoot, { id:'modal', modelValue:open.value, descriptionId:'modal-description', 'onUpdate:modelValue': v=>{if(allow(client))open.value=v;}, onDismissRequest:r=>record(client,r)}, () => [
        h(AlertDialogTitle, {}, ()=>'Confirm changes'),
        h(AlertDialogDescription, {}, ()=>'Review the consequences before confirming.'),
        h(AlertDialogCancel, {id:'close',autofocus:true}, ()=>'Cancel'),
      ]),
    ]);
  }});
}
export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component, signal } = await import('@angular/core');
  const { VfAlertDialogRootDirective, VfAlertDialogTitleDirective, VfAlertDialogDescriptionDirective, VfAlertDialogCancelDirective } = await import('@vyrnforge/angular/alert-dialog');
  class TestApp {
    open = signal(false);
    changed(v) { if(allow(client)) this.open.set(v); }
    dismissed(r) { record(client,r); }
  }
  Component({ selector:'vf-alert-dialog-test', standalone:true, imports:[VfAlertDialogRootDirective,VfAlertDialogTitleDirective,VfAlertDialogDescriptionDirective,VfAlertDialogCancelDirective],
    template:`<main><h1>AlertDialog browser fixture</h1><button id="trigger" type="button" (click)="open.set(true)">Open Confirm changes</button><dialog id="modal" vfAlertDialogRoot [open]="open()" (openChange)="changed($event)" (dismissRequest)="dismissed($event)" descriptionId="modal-description"><h2 vfAlertDialogTitle>Confirm changes</h2><p vfAlertDialogDescription>Review the consequences before confirming.</p><button id="close" vfAlertDialogCancel autofocus>Cancel</button></dialog></main>`
  })(TestApp);
  return TestApp;
}
export async function createElementsStory({ client }) {
  return {body:`<button id="trigger" type="button">Open Confirm changes</button><vf-alert-dialog id="owner"><dialog id="modal"><h2 data-vf-alert-dialog-title>Confirm changes</h2><p data-vf-alert-dialog-description>Review the consequences before confirming.</p><button id="close" type="button" data-vf-alert-dialog-cancel autofocus>Cancel</button></dialog></vf-alert-dialog>`,
    activate:client?async()=>{
      const { defineAlertDialogElement } = await import('@vyrnforge/elements/alert-dialog');
      defineAlertDialogElement();
      const owner=document.querySelector('#owner');
      document.querySelector('#trigger').addEventListener('click',()=>{owner.open=true;});
      owner.addEventListener('vf-dismiss-request', e=>{record(true,e.detail); if(!allow(true))e.preventDefault();});
      document.body.dataset.modalReady='true';
    }:undefined
  };
}

export const browserFixture = { ...definition, prepare: async ({root, fixturePath, port})=>{
  await prepareBrowserFixture({root, fixturePath, port, component:'alert-dialog', fixtureModule:{browserFixture:definition,createReactStory,createVueStory,createAngularStory,createElementsStory}});
  if(port==='react'){
    const dir=path.join(root,'dist/browser-fixtures/components/alert-dialog');
    const entry=path.join(root,'product/components/composite-widgets/transient-surfaces/alert-dialog/examples/destructive-commit/react.tsx');
    await build({entryPoints:[entry],bundle:true,format:'esm',platform:'browser',outdir:dir,entryNames:'destructive-react'});
    await writeFile(path.join(dir,'destructive-react.html'),'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Alert dialog destructive workflow fixture</title><link rel="stylesheet" href="./destructive-react.css"></head><body><div id="root"></div><script type="module" src="./destructive-react.js"></script></body></html>');
  }
}};
