const native = `<button id="trigger" type="button">Open Settings</button><dialog id="modal" data-vf-dialog-root data-vf-drawer-root data-vf-placement="end" aria-labelledby="modal-title" aria-describedby="modal-description"><h2 id="modal-title" data-vf-dialog-title>Settings</h2><p id="modal-description" data-vf-dialog-description>Review your settings.</p><button id="close" type="button" data-vf-dialog-close autofocus>Close</button></dialog>`;
const nativeScript = "const dialog=document.querySelector('#modal');document.querySelector('#trigger').addEventListener('click',()=>dialog.showModal());document.querySelector('#close').addEventListener('click',()=>dialog.close());";
const definition = {
  component: 'drawer',
  title: 'Drawer fixture',
  heading: 'Drawer browser fixture',
  ports: {
    web: { body: native, script: nativeScript },
    react: { story: 'createReactStory' },
    vue: { story: 'createVueStory' },
    angular: { story: 'createAngularStory', selector: 'vf-drawer-test' },
    elements: { story: 'createElementsStory' },
  },
};
function record(client, request) {
  if (client) document.body.dataset.dismissReason = request.reason;
}
function allow(client) { return !client || document.body.dataset.rejectClose !== 'true'; }
export async function createReactStory({ client }) {
  const { createElement: h, useState } = await import('react');
  const { DrawerRoot, DrawerTitle, DrawerDescription, DrawerClose } = await import('@vyrnforge/react/drawer');
  function App() {
    const [open, setOpen] = useState(false);
    return h('div', null,
      h('button', { id: 'trigger', type: 'button', onClick: () => setOpen(true) }, 'Open Settings'),
      h(DrawerRoot, {id:'modal', open, descriptionId:'modal-description', onOpenChange: v => { if(allow(client)) setOpen(v); }, onDismissRequest: r => record(client, r), placement: 'end', backdropDismiss:true},
        h(DrawerTitle, null, 'Settings'),
        h(DrawerDescription, null, 'Review your settings.'),
        h(DrawerClose, {id:'close', autoFocus:true}, 'Close'),
      ),
    );
  }
  return h(App);
}
export async function createVueStory({ client }) {
  const { createSSRApp, h, ref } = await import('vue');
  const { DrawerRoot, DrawerTitle, DrawerDescription, DrawerClose } = await import('@vyrnforge/vue/drawer');
  return createSSRApp({ setup() {
    const open = ref(false);
    return () => h('div', null, [
      h('button', { id:'trigger', type:'button', onClick:()=>{open.value=true;} }, 'Open Settings'),
      h(DrawerRoot, { id:'modal', modelValue:open.value, descriptionId:'modal-description', 'onUpdate:modelValue': v=>{if(allow(client))open.value=v;}, onDismissRequest:r=>record(client,r), placement: 'end', backdropDismiss:true}, () => [
        h(DrawerTitle, {}, ()=>'Settings'),
        h(DrawerDescription, {}, ()=>'Review your settings.'),
        h(DrawerClose, {id:'close',autofocus:true}, ()=>'Close'),
      ]),
    ]);
  }});
}
export async function createAngularStory({ client }) {
  await import('@angular/compiler');
  const { Component, signal } = await import('@angular/core');
  const { VfDrawerRootDirective, VfDrawerTitleDirective, VfDrawerDescriptionDirective, VfDrawerCloseDirective } = await import('@vyrnforge/angular/drawer');
  class TestApp {
    open = signal(false);
    changed(v) { if(allow(client)) this.open.set(v); }
    dismissed(r) { record(client,r); }
  }
  Component({ selector:'vf-drawer-test', standalone:true, imports:[VfDrawerRootDirective,VfDrawerTitleDirective,VfDrawerDescriptionDirective,VfDrawerCloseDirective],
    template:`<main><h1>Drawer browser fixture</h1><button id="trigger" type="button" (click)="open.set(true)">Open Settings</button><dialog id="modal" vfDrawerRoot [open]="open()" (openChange)="changed($event)" (dismissRequest)="dismissed($event)" descriptionId="modal-description" placement="end" backdropDismiss><h2 vfDrawerTitle>Settings</h2><p vfDrawerDescription>Review your settings.</p><button id="close" vfDrawerClose autofocus>Close</button></dialog></main>`
  })(TestApp);
  return TestApp;
}
export async function createElementsStory({ client }) {
  return {body:`<button id="trigger" type="button">Open Settings</button><vf-drawer id="owner" placement="end" backdrop-dismiss><dialog id="modal"><h2 data-vf-drawer-title>Settings</h2><p data-vf-drawer-description>Review your settings.</p><button id="close" type="button" data-vf-drawer-close autofocus>Close</button></dialog></vf-drawer>`,
    activate:client?async()=>{
      const { defineDrawerElement } = await import('@vyrnforge/elements/drawer');
      defineDrawerElement();
      const owner=document.querySelector('#owner');
      document.querySelector('#trigger').addEventListener('click',()=>{owner.open=true;});
      owner.addEventListener('vf-dismiss-request', e=>{record(true,e.detail); if(!allow(true))e.preventDefault();});
      document.body.dataset.modalReady='true';
    }:undefined
  };
}

export const browserFixture = definition;
