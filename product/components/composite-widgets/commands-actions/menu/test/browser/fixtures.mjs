const items = [['edit', 'Edit'], ['locked', 'Locked'], ['duplicate', 'Duplicate'], ['archive', 'Archive']];
const before = '<button id="before" type="button">Before</button>';
const after = '<button id="after" type="button">After</button>';
const web = `<button id="web-trigger" type="button" data-vf-menu-trigger aria-haspopup="menu" aria-expanded="true">Actions</button><div id="web-menu" role="menu" tabindex="-1" aria-label="Actions" data-vf-menu-content><button id="web-edit" type="button" role="menuitem" tabindex="-1" data-vf-menu-item>Edit</button><button id="web-locked" type="button" role="menuitem" tabindex="-1" aria-disabled="true" data-vf-menu-item>Locked</button><button id="web-duplicate" type="button" role="menuitem" tabindex="-1" data-vf-menu-item>Duplicate</button><button id="web-archive" type="button" role="menuitem" tabindex="-1" data-vf-menu-item>Archive</button></div>`;
export const browserFixture = {
  component: 'menu', title: 'Menu fixture', heading: 'Menu browser fixture',
  ports: { web: {body: before + web + after}, react: {story:'createReactStory'}, vue: {story:'createVueStory'}, angular: {story:'createAngularStory',selector:'vf-menu-test'}, elements: {story:'createElementsStory'} }
};
function record(client, id) { if (client) document.body.dataset.selected = id; }
function allow(client, next) { return !client || next || document.body.dataset.rejectClose !== 'true'; }
export async function createReactStory({client}) {
  const {createElement: h, useState, useEffect} = await import('react');
  const {MenuRoot,MenuTrigger,MenuContent,MenuItem} = await import('@vyrnforge/react/menu');
  function App() {
    const [open,setOpen] = useState(false);
    useEffect(()=>{document.body.dataset.menuReady='true';},[]);
    return h('div',null,h('button',{id:'before'},'Before'),h(MenuRoot,{contentId:'react-menu',open,onOpenChange:next=>{if(allow(client,next))setOpen(next);}},h(MenuTrigger,{id:'react-trigger'},'Actions'),h(MenuContent,{'aria-label':'Actions'},...items.map(([id,label])=>h(MenuItem,{key:id,id:'react-'+id,disabled:id==='locked',onClick:id==='locked'?()=>{document.body.dataset.disabledClicked=id}:undefined,onSelect:()=>record(client,'react-'+id)},label)))),h('button',{id:'after'},'After'));
  }
  return h(App);
}
export async function createVueStory({client}) {
  const {createSSRApp,h,ref,onMounted}=await import('vue');
  const {MenuRoot,MenuTrigger,MenuContent,MenuItem}=await import('@vyrnforge/vue/menu');
  return createSSRApp({setup(){const open=ref(false);onMounted(()=>{document.body.dataset.menuReady='true';});return ()=>h('div',null,[h('button',{id:'before'},'Before'),h(MenuRoot,{contentId:'vue-menu',open:open.value,'onUpdate:open':next=>{if(allow(client,next))open.value=next;}},()=>[h(MenuTrigger,{id:'vue-trigger'},()=> 'Actions'),h(MenuContent,{'aria-label':'Actions'},()=>items.map(([id,label])=>h(MenuItem,{key:id,id:'vue-'+id,disabled:id==='locked',onClick:id==='locked'?()=>{document.body.dataset.disabledClicked=id}:undefined,onSelect:()=>record(client,'vue-'+id)},()=>label)))]),h('button',{id:'after'},'After')]);}});
}
export async function createAngularStory({client}) {
  await import('@angular/compiler');
  const {Component,signal,afterNextRender}=await import('@angular/core');
  const {VfMenuRootDirective,VfMenuTriggerDirective,VfMenuContentDirective,VfMenuItemDirective}=await import('@vyrnforge/angular/menu');
  class App {
    open=signal(false);
    constructor(){afterNextRender(()=>{document.body.dataset.menuReady='true';});}
    changed(next){if(allow(client,next))this.open.set(next);}
    selected(id){record(client,id);}
  }
  Component({selector:'vf-menu-test',standalone:true,imports:[VfMenuRootDirective,VfMenuTriggerDirective,VfMenuContentDirective,VfMenuItemDirective],template:before+'<div vfMenuRoot id="angular-root" contentId="angular-menu" [open]="open()" (openChange)="changed($event)"><button vfMenuTrigger id="angular-trigger">Actions</button><div vfMenuContent aria-label="Actions">'+items.map(([id,label])=>'<button vfMenuItem id="angular-'+id+'" '+(id==='locked'?'[disabled]="true" ':'')+'(selected)="selected(\'angular-'+id+'\')">'+label+'</button>').join('')+'</div></div>'+after})(App);
  return App;
}
export async function createElementsStory({client}) {
  return {body:before+'<vf-menu><button id="elements-trigger" type="button" data-vf-menu-trigger>Actions</button><div id="elements-menu" data-vf-menu-content aria-label="Actions" popover="auto">'+items.map(([id,label])=>'<button id="elements-'+id+'" type="button" data-vf-menu-item '+(id==='locked'?'aria-disabled="true"':'')+'>'+label+'</button>').join('')+'</div></vf-menu>'+after,activate:client?async()=>{const {defineMenuElement}=await import('@vyrnforge/elements/menu');defineMenuElement();document.querySelector('vf-menu').addEventListener('vf-select',event=>record(true,event.detail.item.id));document.body.dataset.menuReady='true';}:undefined};
}
