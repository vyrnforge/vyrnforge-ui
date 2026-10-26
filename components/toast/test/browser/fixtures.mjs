import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2] || 'web';
const root = process.cwd();
const outDir = path.join(root, 'dist/docs/next/toast-fixtures');
await mkdir(outDir, { recursive: true });

const toastCss = await readFile(path.join(root, 'packages/web/dist/components/toast/toast.css'), 'utf8');
const tokenCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
await writeFile(path.join(outDir, 'toast.css'), `${tokenCss}\n${toastCss.replace('@import "../../styles/tokens.css";', '')}`);

const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./toast.css"><title>Toast fixture</title></head><body><main><h1>Toast browser fixture</h1><button id="outside-focus" type="button">Outside focus</button>${body}</main>${script}</body></html>`;

if (port === 'web') {
  await writeFile(path.join(outDir, 'web.html'), page(`<div id="viewport" data-vf-toast-viewport aria-live="polite" aria-relevant="additions text"><div id="web-toast" data-vf-toast-root><strong data-vf-toast-title>Saved</strong><p data-vf-toast-description>Your changes are available.</p><button type="button" data-vf-toast-close aria-label="Tutup notifikasi">×</button></div></div>`));
}

if (port === 'react') {
  await writeFile(path.join(outDir, 'react.html'), page('<div id="app"></div>', '<script type="module" src="./react.js"></script>'));
  await build({
    stdin: {
      resolveDir: root,
      sourcefile: 'react-toast-client.tsx',
      contents: `
import React,{useState}from'react';
import{createRoot}from'react-dom/client';
import{flushSync}from'react-dom';
import{ToastViewport,ToastRoot,ToastTitle,ToastDescription,ToastClose}from'@vyrnforge/react/toast';
function Content({label='Close notification',cancel=false}){return <><ToastTitle>Saved</ToastTitle><ToastDescription>Your changes are available.</ToastDescription><ToastClose aria-label={label} onClick={cancel?(event)=>event.preventDefault():undefined}>×</ToastClose></>}
function App(){
 const[acceptOpen,setAcceptOpen]=useState(true),[acceptCount,setAcceptCount]=useState(0);
 const[rejectCount,setRejectCount]=useState(0),[uncontrolledCount,setUncontrolledCount]=useState(0);
 const[initialOpen,setInitialOpen]=useState(false),[initialCount,setInitialCount]=useState(0);
 const[cycleOpen,setCycleOpen]=useState(true),[cycleCount,setCycleCount]=useState(0);
 const[durationOpen,setDurationOpen]=useState(true),[durationValue,setDurationValue]=useState(200),[durationCount,setDurationCount]=useState(0);
 const[rerenderOpen,setRerenderOpen]=useState(true),[rerenderTick,setRerenderTick]=useState(0),[rerenderCount,setRerenderCount]=useState(0);
 const[timeoutOpen,setTimeoutOpen]=useState(true),[timeoutCount,setTimeoutCount]=useState(0);
 const[dynamicOpen,setDynamicOpen]=useState(false);
 return <ToastViewport id="viewport">
  <section data-case="controlled-accept"><ToastRoot id="controlled-accept" open={acceptOpen} duration={0} onOpenChange={(next)=>{setAcceptCount(v=>v+1);setAcceptOpen(next)}}><Content/></ToastRoot><output id="controlled-accept-count">{acceptCount}</output><button id="controlled-accept-open" onClick={()=>setAcceptOpen(true)}>Open accepted</button></section>
  <section data-case="controlled-reject"><ToastRoot id="controlled-reject" open={true} duration={0} onOpenChange={()=>setRejectCount(v=>v+1)}><Content/></ToastRoot><output id="controlled-reject-count">{rejectCount}</output></section>
  <section data-case="uncontrolled"><ToastRoot id="uncontrolled" defaultOpen duration={0} onOpenChange={()=>setUncontrolledCount(v=>v+1)}><Content/></ToastRoot><output id="uncontrolled-count">{uncontrolledCount}</output></section>
  <section data-case="initial"><ToastRoot id="initial" open={initialOpen} duration={100} onOpenChange={(next)=>{setInitialCount(v=>v+1);setInitialOpen(next)}}><Content/></ToastRoot><output id="initial-count">{initialCount}</output><button id="initial-open" onClick={()=>setInitialOpen(true)}>Open initial</button></section>
  <section data-case="cycle"><ToastRoot id="cycle" open={cycleOpen} duration={100} onOpenChange={(next)=>{setCycleCount(v=>v+1);setCycleOpen(next)}}><Content/></ToastRoot><output id="cycle-count">{cycleCount}</output><button id="cycle-open" onClick={()=>setCycleOpen(true)}>Reopen cycle</button></section>
  <section data-case="duration"><ToastRoot id="duration" open={durationOpen} duration={durationValue} onOpenChange={(next)=>{setDurationCount(v=>v+1);setDurationOpen(next)}}><Content/></ToastRoot><output id="duration-count">{durationCount}</output><output id="duration-value">{durationValue}</output><button id="duration-100" onClick={()=>setDurationValue(100)}>100</button><button id="duration-zero" onClick={()=>setDurationValue(0)}>Persistent</button><button id="duration-invalid" onClick={()=>setDurationValue(Number.NaN)}>Invalid</button><button id="duration-open" onClick={()=>setDurationOpen(true)}>Open duration</button></section>
  <section data-case="rerender"><ToastRoot id="rerender" open={rerenderOpen} duration={100} onOpenChange={(next)=>{setRerenderCount(v=>v+1);setRerenderOpen(next)}}><Content/></ToastRoot><output id="rerender-count">{rerenderCount}</output><output id="rerender-tick">{rerenderTick}</output><button id="rerender-button" onClick={()=>setRerenderTick(v=>v+1)}>Rerender</button></section>
  <section data-case="timeout-reject"><ToastRoot id="timeout-reject" open={timeoutOpen} duration={100} onOpenChange={()=>setTimeoutCount(v=>v+1)}><Content/></ToastRoot><output id="timeout-reject-count">{timeoutCount}</output><button id="timeout-close" onClick={()=>setTimeoutOpen(false)}>Commit closed</button><button id="timeout-open" onClick={()=>setTimeoutOpen(true)}>Commit open</button></section>
  <section data-case="pause"><ToastRoot id="pause" defaultOpen duration={100}><Content label="Pause close"/></ToastRoot></section>
  <section data-case="cancel"><ToastRoot id="cancel" defaultOpen duration={0}><Content label="Cancel close" cancel/></ToastRoot></section>
  <section data-case="localized"><ToastRoot id="localized" defaultOpen duration={0}><ToastTitle>Tersimpan</ToastTitle><ToastDescription>Perubahan tersedia.</ToastDescription><ToastClose aria-label="Tutup notifikasi">×</ToastClose></ToastRoot><ToastRoot id="visible-name" defaultOpen duration={0}><ToastTitle>Saved</ToastTitle><ToastClose>Close notification</ToastClose></ToastRoot></section>
  <section data-case="siblings"><ToastRoot id="sibling-a" defaultOpen duration={0}><Content label="Close first"/></ToastRoot><ToastRoot id="sibling-b" defaultOpen duration={0}><Content label="Close second"/></ToastRoot></section>
  <section data-case="dynamic"><ToastRoot id="dynamic" open={dynamicOpen} duration={0} onOpenChange={setDynamicOpen}><Content/></ToastRoot><button id="dynamic-open" onClick={()=>setDynamicOpen(true)}>Show status</button></section>
 </ToastViewport>;
}
const root=createRoot(document.querySelector('#app'));flushSync(()=>root.render(<App/>));globalThis.__toastUnmount=()=>root.unmount();document.body.dataset.ready='react';
`,
    },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outfile: path.join(outDir, 'react.js'),
  });
}

if (port === 'angular') {
  await writeFile(path.join(outDir, 'angular.html'), page('<vf-toast-test></vf-toast-test>', '<script type="module" src="./angular.js"></script>'));
  await build({
    stdin: {
      resolveDir: root,
      sourcefile: 'angular-toast-client.ts',
      contents: `
import'@angular/compiler';
import{Component,provideZonelessChangeDetection,signal}from'@angular/core';
import{bootstrapApplication}from'@angular/platform-browser';
import{VfToastViewportDirective,VfToastRootDirective,VfToastTitleDirective,VfToastDescriptionDirective,VfToastCloseDirective}from'@vyrnforge/angular/toast';
const imports=[VfToastViewportDirective,VfToastRootDirective,VfToastTitleDirective,VfToastDescriptionDirective,VfToastCloseDirective];
const content=(label,extra='')=>\`<div vfToastTitle>Saved</div><div vfToastDescription>Your changes are available.</div><button vfToastClose aria-label="\${label}" \${extra}>×</button>\`;
const template=\`<div vfToastViewport id="viewport">
<section><div vfToastRoot id="controlled-accept" [open]="acceptOpen()" [duration]="0" (openChange)="accept($event)">\${content('Close notification')}</div><output id="controlled-accept-count">{{acceptCount()}}</output><button id="controlled-accept-open" (click)="acceptOpen.set(true)">Open accepted</button></section>
<section><div vfToastRoot id="controlled-reject" [open]="true" [duration]="0" (openChange)="rejectCount.update(value=>value+1)">\${content('Close notification')}</div><output id="controlled-reject-count">{{rejectCount()}}</output></section>
<section><div vfToastRoot id="uncontrolled" [defaultOpen]="true" [duration]="0" (openChange)="uncontrolledCount.update(value=>value+1)">\${content('Close notification')}</div><output id="uncontrolled-count">{{uncontrolledCount()}}</output></section>
<section><div vfToastRoot id="initial" [open]="initialOpen()" [duration]="100" (openChange)="initial($event)">\${content('Close notification')}</div><output id="initial-count">{{initialCount()}}</output><button id="initial-open" (click)="initialOpen.set(true)">Open initial</button></section>
<section><div vfToastRoot id="cycle" [open]="cycleOpen()" [duration]="100" (openChange)="cycle($event)">\${content('Close notification')}</div><output id="cycle-count">{{cycleCount()}}</output><button id="cycle-open" (click)="cycleOpen.set(true)">Reopen cycle</button></section>
<section><div vfToastRoot id="duration" [open]="durationOpen()" [duration]="durationValue()" (openChange)="durationChanged($event)">\${content('Close notification')}</div><output id="duration-count">{{durationCount()}}</output><output id="duration-value">{{durationValue()}}</output><button id="duration-100" (click)="durationValue.set(100)">100</button><button id="duration-zero" (click)="durationValue.set(0)">Persistent</button><button id="duration-invalid" (click)="durationValue.set(NaN)">Invalid</button><button id="duration-open" (click)="durationOpen.set(true)">Open duration</button></section>
<section><div vfToastRoot id="rerender" [open]="rerenderOpen()" [duration]="100" (openChange)="rerenderChanged($event)">\${content('Close notification')}</div><output id="rerender-count">{{rerenderCount()}}</output><output id="rerender-tick">{{rerenderTick()}}</output><button id="rerender-button" (click)="rerenderTick.update(value=>value+1)">Rerender</button></section>
<section><div vfToastRoot id="timeout-reject" [open]="timeoutOpen()" [duration]="100" (openChange)="timeoutCount.update(value=>value+1)">\${content('Close notification')}</div><output id="timeout-reject-count">{{timeoutCount()}}</output><button id="timeout-close" (click)="timeoutOpen.set(false)">Commit closed</button><button id="timeout-open" (click)="timeoutOpen.set(true)">Commit open</button></section>
<section><div vfToastRoot id="pause" [defaultOpen]="true" [duration]="100">\${content('Pause close')}</div></section>
<section><div vfToastRoot id="cancel" [defaultOpen]="true" [duration]="0">\${content('Cancel close','(click)="$event.preventDefault()"')}</div></section>
<section><div vfToastRoot id="localized" [defaultOpen]="true" [duration]="0"><div vfToastTitle>Tersimpan</div><div vfToastDescription>Perubahan tersedia.</div><button vfToastClose aria-label="Tutup notifikasi">×</button></div><div vfToastRoot id="visible-name" [defaultOpen]="true" [duration]="0"><div vfToastTitle>Saved</div><button vfToastClose>Close notification</button></div></section>
<section><div vfToastRoot id="sibling-a" [defaultOpen]="true" [duration]="0">\${content('Close first')}</div><div vfToastRoot id="sibling-b" [defaultOpen]="true" [duration]="0">\${content('Close second')}</div></section>
<section><div vfToastRoot id="dynamic" [open]="dynamicOpen()" [duration]="0" (openChange)="dynamicOpen.set($event)">\${content('Close notification')}</div><button id="dynamic-open" (click)="dynamicOpen.set(true)">Show status</button></section>
</div>\`;
class App{acceptOpen=signal(true);acceptCount=signal(0);rejectCount=signal(0);uncontrolledCount=signal(0);initialOpen=signal(false);initialCount=signal(0);cycleOpen=signal(true);cycleCount=signal(0);durationOpen=signal(true);durationValue=signal(200);durationCount=signal(0);rerenderOpen=signal(true);rerenderTick=signal(0);rerenderCount=signal(0);timeoutOpen=signal(true);timeoutCount=signal(0);dynamicOpen=signal(false);NaN=Number.NaN;accept(next){this.acceptCount.update(v=>v+1);this.acceptOpen.set(next)}initial(next){this.initialCount.update(v=>v+1);this.initialOpen.set(next)}cycle(next){this.cycleCount.update(v=>v+1);this.cycleOpen.set(next)}durationChanged(next){this.durationCount.update(v=>v+1);this.durationOpen.set(next)}rerenderChanged(next){this.rerenderCount.update(v=>v+1);this.rerenderOpen.set(next)}}
Component({selector:'vf-toast-test',standalone:true,imports,template})(App);
bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]}).then(ref=>{globalThis.__toastUnmount=()=>ref.destroy();document.body.dataset.ready='angular'});
`,
    },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outfile: path.join(outDir, 'angular.js'),
  });
}

if (port === 'vue') {
  await writeFile(path.join(outDir, 'vue.html'), page('<div id="app"></div>', '<script type="module" src="./vue.js"></script>'));
  await build({
    stdin: {
      resolveDir: root,
      sourcefile: 'vue-toast-client.ts',
      contents: `
import{createApp,defineComponent,h,ref}from'vue';
import{ToastViewport,ToastRoot,ToastTitle,ToastDescription,ToastClose}from'@vyrnforge/vue/toast';
const content=(label='Close notification',onClick)=>[h(ToastTitle,null,()=> 'Saved'),h(ToastDescription,null,()=> 'Your changes are available.'),h(ToastClose,{'aria-label':label,onClick},()=> '×')];
const App=defineComponent({setup(){
 const acceptOpen=ref(true),acceptCount=ref(0),rejectCount=ref(0),uncontrolledCount=ref(0),initialOpen=ref(false),initialCount=ref(0),cycleOpen=ref(true),cycleCount=ref(0),durationOpen=ref(true),durationValue=ref(200),durationCount=ref(0),rerenderOpen=ref(true),rerenderTick=ref(0),rerenderCount=ref(0),timeoutOpen=ref(true),timeoutCount=ref(0),dynamicOpen=ref(false);
 const button=(id,label,onClick)=>h('button',{id,onClick},label),output=(id,value)=>h('output',{id},String(value));
 return()=>h(ToastViewport,{id:'viewport'},()=>[
  h('section',[h(ToastRoot,{id:'controlled-accept',open:acceptOpen.value,duration:0,'onUpdate:open':next=>{acceptCount.value++;acceptOpen.value=next}},()=>content()),output('controlled-accept-count',acceptCount.value),button('controlled-accept-open','Open accepted',()=>acceptOpen.value=true)]),
  h('section',[h(ToastRoot,{id:'controlled-reject',open:true,duration:0,'onUpdate:open':()=>rejectCount.value++},()=>content()),output('controlled-reject-count',rejectCount.value)]),
  h('section',[h(ToastRoot,{id:'uncontrolled',defaultOpen:true,duration:0,'onUpdate:open':()=>uncontrolledCount.value++},()=>content()),output('uncontrolled-count',uncontrolledCount.value)]),
  h('section',[h(ToastRoot,{id:'initial',open:initialOpen.value,duration:100,'onUpdate:open':next=>{initialCount.value++;initialOpen.value=next}},()=>content()),output('initial-count',initialCount.value),button('initial-open','Open initial',()=>initialOpen.value=true)]),
  h('section',[h(ToastRoot,{id:'cycle',open:cycleOpen.value,duration:100,'onUpdate:open':next=>{cycleCount.value++;cycleOpen.value=next}},()=>content()),output('cycle-count',cycleCount.value),button('cycle-open','Reopen cycle',()=>cycleOpen.value=true)]),
  h('section',[h(ToastRoot,{id:'duration',open:durationOpen.value,duration:durationValue.value,'onUpdate:open':next=>{durationCount.value++;durationOpen.value=next}},()=>content()),output('duration-count',durationCount.value),output('duration-value',durationValue.value),button('duration-100','100',()=>durationValue.value=100),button('duration-zero','Persistent',()=>durationValue.value=0),button('duration-invalid','Invalid',()=>durationValue.value=Number.NaN),button('duration-open','Open duration',()=>durationOpen.value=true)]),
  h('section',[h(ToastRoot,{id:'rerender',open:rerenderOpen.value,duration:100,'onUpdate:open':next=>{rerenderCount.value++;rerenderOpen.value=next}},()=>content()),output('rerender-count',rerenderCount.value),output('rerender-tick',rerenderTick.value),button('rerender-button','Rerender',()=>rerenderTick.value++)]),
  h('section',[h(ToastRoot,{id:'timeout-reject',open:timeoutOpen.value,duration:100,'onUpdate:open':()=>timeoutCount.value++},()=>content()),output('timeout-reject-count',timeoutCount.value),button('timeout-close','Commit closed',()=>timeoutOpen.value=false),button('timeout-open','Commit open',()=>timeoutOpen.value=true)]),
  h('section',[h(ToastRoot,{id:'pause',defaultOpen:true,duration:100},()=>content('Pause close'))]),
  h('section',[h(ToastRoot,{id:'cancel',defaultOpen:true,duration:0},()=>content('Cancel close',event=>event.preventDefault()))]),
  h('section',[h(ToastRoot,{id:'localized',defaultOpen:true,duration:0},()=>[h(ToastTitle,null,()=> 'Tersimpan'),h(ToastDescription,null,()=> 'Perubahan tersedia.'),h(ToastClose,{'aria-label':'Tutup notifikasi'},()=> '×')]),h(ToastRoot,{id:'visible-name',defaultOpen:true,duration:0},()=>[h(ToastTitle,null,()=> 'Saved'),h(ToastClose,null,()=> 'Close notification')])]),
  h('section',[h(ToastRoot,{id:'sibling-a',defaultOpen:true,duration:0},()=>content('Close first')),h(ToastRoot,{id:'sibling-b',defaultOpen:true,duration:0},()=>content('Close second'))]),
  h('section',[h(ToastRoot,{id:'dynamic',open:dynamicOpen.value,duration:0,'onUpdate:open':next=>dynamicOpen.value=next},()=>content()),button('dynamic-open','Show status',()=>dynamicOpen.value=true)])
 ]);
}});
const app=createApp(App);app.mount('#app');globalThis.__toastUnmount=()=>app.unmount();document.body.dataset.ready='vue';
`,
    },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outfile: path.join(outDir, 'vue.js'),
  });
}

if (port === 'elements') {
  const rootMarkup = (id, label, attributes = '') => `<vf-toast id="${id}" ${attributes}><strong data-vf-toast-title>Saved</strong><p data-vf-toast-description>Your changes are available.</p><button type="button" data-vf-toast-close aria-label="${label}">×</button></vf-toast>`;
  await writeFile(path.join(outDir, 'elements.html'), page(`<vf-toast-viewport id="viewport">
<section>${rootMarkup('controlled-accept', 'Close notification')}<output id="controlled-accept-count">0</output><button id="controlled-accept-open">Open accepted</button></section>
<section>${rootMarkup('controlled-reject', 'Close notification')}<output id="controlled-reject-count">0</output></section>
<section>${rootMarkup('uncontrolled', 'Close notification', 'duration="0"')}<output id="uncontrolled-count">0</output></section>
<section>${rootMarkup('initial', 'Close notification', 'duration="100"')}<output id="initial-count">0</output><button id="initial-open">Open initial</button></section>
<section>${rootMarkup('cycle', 'Close notification', 'duration="100"')}<output id="cycle-count">0</output><button id="cycle-open">Reopen cycle</button></section>
<section>${rootMarkup('duration', 'Close notification', 'duration="200"')}<output id="duration-count">0</output><output id="duration-value">200</output><button id="duration-100">100</button><button id="duration-zero">Persistent</button><button id="duration-invalid">Invalid</button><button id="duration-open">Open duration</button></section>
<section>${rootMarkup('rerender', 'Close notification', 'duration="100"')}<output id="rerender-count">0</output><output id="rerender-tick">0</output><button id="rerender-button">Rerender</button></section>
<section>${rootMarkup('timeout-reject', 'Close notification', 'duration="100"')}<output id="timeout-reject-count">0</output><button id="timeout-close">Commit closed</button><button id="timeout-open">Commit open</button></section>
<section>${rootMarkup('pause', 'Pause close', 'duration="100"')}</section>
<section>${rootMarkup('cancel', 'Cancel close', 'duration="0"')}</section>
<section><vf-toast id="localized" duration="0"><strong data-vf-toast-title>Tersimpan</strong><p data-vf-toast-description>Perubahan tersedia.</p><button type="button" data-vf-toast-close aria-label="Tutup notifikasi">×</button></vf-toast><vf-toast id="visible-name" duration="0"><strong data-vf-toast-title>Saved</strong><button type="button" data-vf-toast-close>Close notification</button></vf-toast></section>
<section>${rootMarkup('sibling-a', 'Close first', 'duration="0"')}${rootMarkup('sibling-b', 'Close second', 'duration="0"')}</section>
<section>${rootMarkup('dynamic', 'Close notification', 'duration="0"')}<button id="dynamic-open">Show status</button></section>
</vf-toast-viewport>`, '<script type="module" src="./elements.js"></script>'));
  await build({
    stdin: {
      resolveDir: root,
      sourcefile: 'elements-toast-client.ts',
      contents: `
import{defineToastViewportElement,defineToastRootElement}from'@vyrnforge/elements/toast';
defineToastViewportElement();defineToastRootElement();
const byId=id=>document.getElementById(id),count=id=>{const node=byId(id);node.textContent=String(Number(node.textContent)+1)};
const controlled=(id,countId,accept=true)=>{const root=byId(id);root.open=true;root.addEventListener('vf-open-change',event=>{count(countId);if(accept)root.open=event.detail.open})};
controlled('controlled-accept','controlled-accept-count',true);controlled('controlled-reject','controlled-reject-count',false);
byId('controlled-accept-open').onclick=()=>byId('controlled-accept').open=true;
byId('uncontrolled').addEventListener('vf-open-change',()=>count('uncontrolled-count'));
const initial=byId('initial');initial.open=false;initial.addEventListener('vf-open-change',event=>{count('initial-count');initial.open=event.detail.open});byId('initial-open').onclick=()=>initial.open=true;
const cycle=byId('cycle');cycle.open=true;cycle.addEventListener('vf-open-change',event=>{count('cycle-count');cycle.open=event.detail.open});byId('cycle-open').onclick=()=>cycle.open=true;
const duration=byId('duration');duration.open=true;duration.addEventListener('vf-open-change',event=>{count('duration-count');duration.open=event.detail.open});const setDuration=value=>{duration.duration=value;byId('duration-value').textContent=String(value)};byId('duration-100').onclick=()=>setDuration(100);byId('duration-zero').onclick=()=>setDuration(0);byId('duration-invalid').onclick=()=>setDuration(Number.NaN);byId('duration-open').onclick=()=>duration.open=true;
const rerender=byId('rerender');rerender.open=true;rerender.addEventListener('vf-open-change',event=>{count('rerender-count');rerender.open=event.detail.open});byId('rerender-button').onclick=()=>count('rerender-tick');
const timeout=byId('timeout-reject');timeout.open=true;timeout.addEventListener('vf-open-change',()=>count('timeout-reject-count'));byId('timeout-close').onclick=()=>timeout.open=false;byId('timeout-open').onclick=()=>timeout.open=true;
byId('cancel').querySelector('[data-vf-toast-close]').addEventListener('click',event=>event.preventDefault());
const dynamic=byId('dynamic');dynamic.open=false;dynamic.addEventListener('vf-open-change',event=>dynamic.open=event.detail.open);byId('dynamic-open').onclick=()=>dynamic.open=true;
globalThis.__toastUnmount=()=>byId('viewport').remove();document.body.dataset.ready='elements';
`,
    },
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outfile: path.join(outDir, 'elements.js'),
  });
}
