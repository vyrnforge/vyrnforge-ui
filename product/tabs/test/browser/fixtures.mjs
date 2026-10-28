import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2] || 'web';
const root = process.cwd();
const outDir = path.join(root, 'dist/browser-fixtures/components/tabs');
await mkdir(outDir, { recursive: true });

const tabsCss = await readFile(path.join(root, 'packages/web/dist/components/tabs/tabs.css'), 'utf8');
const tokenCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
await writeFile(path.join(outDir, 'tabs.css'), `${tokenCss}\n${tabsCss.replace('@import "../../styles/tokens.css";', '')}`);
const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./tabs.css"><title>Tabs fixture</title></head><body><main><h1>Tabs browser fixture</h1>${body}</main>${script}</body></html>`;

const staticTabs = `
<div id="web-tabs" data-vf-tabs-root data-vf-orientation="horizontal" data-vf-activation="automatic">
  <div role="tablist" aria-label="Account sections" aria-orientation="horizontal" data-vf-tabs-list data-vf-orientation="horizontal">
    <button id="web-tabs-tab-overview" type="button" role="tab" tabindex="0" aria-selected="true" aria-controls="web-tabs-panel-overview" data-vf-tabs-tab data-vf-value="overview" data-vf-selected>Overview</button>
    <button id="web-tabs-tab-billing" type="button" role="tab" tabindex="-1" aria-selected="false" aria-disabled="true" disabled aria-controls="web-tabs-panel-billing" data-vf-tabs-tab data-vf-value="billing" data-vf-disabled>Billing</button>
    <button id="web-tabs-tab-security" type="button" role="tab" tabindex="-1" aria-selected="false" aria-controls="web-tabs-panel-security" data-vf-tabs-tab data-vf-value="security">Security</button>
  </div>
  <div id="web-tabs-panel-overview" role="tabpanel" tabindex="0" aria-labelledby="web-tabs-tab-overview" data-vf-tabs-panel data-vf-selected>Overview panel</div>
  <div id="web-tabs-panel-billing" role="tabpanel" tabindex="0" aria-labelledby="web-tabs-tab-billing" data-vf-tabs-panel hidden>Billing panel</div>
  <div id="web-tabs-panel-security" role="tabpanel" tabindex="0" aria-labelledby="web-tabs-tab-security" data-vf-tabs-panel hidden>Security panel</div>
</div>`;

if (port === 'web') await writeFile(path.join(outDir, 'web.html'), page(staticTabs));

if (port === 'react') {
  const { createElement, Fragment } = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { TabsList, TabsPanel, TabsRoot, TabsTab } = await import('@vyrnforge/react/tabs');
  const tabs = (id, options = {}) => createElement(TabsRoot, { id, defaultValue: 'overview', ...options.root },
    createElement(TabsList, { 'aria-label': options.label ?? 'Account sections' },
      createElement(TabsTab, { value: 'overview' }, 'Overview'),
      createElement(TabsTab, { value: 'billing', disabled: true }, 'Billing'),
      createElement(TabsTab, { value: 'security' }, 'Security'),
      ...(options.activity === false ? [] : [createElement(TabsTab, { key: 'activity', value: 'activity' }, 'Activity')])),
    createElement(TabsPanel, { value: 'overview' }, 'Overview panel'),
    createElement(TabsPanel, { value: 'billing' }, 'Billing panel'),
    createElement(TabsPanel, { value: 'security' }, 'Security panel'),
    ...(options.activity === false ? [] : [createElement(TabsPanel, { key: 'activity-panel', value: 'activity' }, 'Activity panel')]));
  const app = (client = false) => createElement(Fragment, null,
    tabs('react-tabs', { root: { dir: 'rtl', onValueChange: client ? (value) => { document.body.dataset.value = value; } : () => undefined } }),
    tabs('react-manual-tabs', { activity: false, label: 'Manual vertical sections', root: { orientation: 'vertical', activation: 'manual', onValueChange: client ? (value) => { document.body.dataset.manualValue = value; } : () => undefined } }));
  const markup = renderToString(app(false));
  await writeFile(path.join(outDir, 'react.html'), page(`<div id="react-root">${markup}</div>`, '<script type="module" src="./react.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'react-tabs-client.ts', contents: `import {createElement,Fragment} from 'react';import {hydrateRoot} from 'react-dom/client';import {TabsRoot,TabsList,TabsTab,TabsPanel} from '@vyrnforge/react/tabs';const tabs=(id,options={})=>createElement(TabsRoot,{id,defaultValue:'overview',...options.root},createElement(TabsList,{'aria-label':options.label??'Account sections'},createElement(TabsTab,{value:'overview'},'Overview'),createElement(TabsTab,{value:'billing',disabled:true},'Billing'),createElement(TabsTab,{value:'security'},'Security'),...(options.activity===false?[]:[createElement(TabsTab,{key:'activity',value:'activity'},'Activity')])),createElement(TabsPanel,{value:'overview'},'Overview panel'),createElement(TabsPanel,{value:'billing'},'Billing panel'),createElement(TabsPanel,{value:'security'},'Security panel'),...(options.activity===false?[]:[createElement(TabsPanel,{key:'activity-panel',value:'activity'},'Activity panel')]));const app=createElement(Fragment,null,tabs('react-tabs',{root:{dir:'rtl',onValueChange:(value)=>document.body.dataset.value=value}}),tabs('react-manual-tabs',{activity:false,label:'Manual vertical sections',root:{orientation:'vertical',activation:'manual',onValueChange:(value)=>document.body.dataset.manualValue=value}}));hydrateRoot(document.querySelector('#react-root'),app);` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'react.js') });
}

if (port === 'vue') {
  const { createSSRApp, h } = await import('vue');
  const { renderToString } = await import('@vue/server-renderer');
  const { TabsList, TabsPanel, TabsRoot, TabsTab } = await import('@vyrnforge/vue/tabs');
  const tabs = (id, options = {}) => h(TabsRoot, { id, defaultValue: 'overview', ...options.root }, () => [
    h(TabsList, { 'aria-label': options.label ?? 'Account sections' }, () => [h(TabsTab, { value: 'overview' }, () => 'Overview'), h(TabsTab, { value: 'billing', disabled: true }, () => 'Billing'), h(TabsTab, { value: 'security' }, () => 'Security'), ...(options.activity === false ? [] : [h(TabsTab, { value: 'activity' }, () => 'Activity')])]),
    h(TabsPanel, { value: 'overview' }, () => 'Overview panel'), h(TabsPanel, { value: 'billing' }, () => 'Billing panel'), h(TabsPanel, { value: 'security' }, () => 'Security panel'), ...(options.activity === false ? [] : [h(TabsPanel, { value: 'activity' }, () => 'Activity panel')]),
  ]);
  const createApp = (client = false) => createSSRApp({ render: () => h('div', [
    tabs('vue-tabs', { root: { dir: 'rtl', onValueChange: client ? (value) => { document.body.dataset.value = value; } : () => undefined } }),
    tabs('vue-manual-tabs', { activity: false, label: 'Manual vertical sections', root: { orientation: 'vertical', activation: 'manual', onValueChange: client ? (value) => { document.body.dataset.manualValue = value; } : () => undefined } }),
  ]) });
  const markup = await renderToString(createApp());
  await writeFile(path.join(outDir, 'vue.html'), page(`<div id="vue-root">${markup}</div>`, '<script type="module" src="./vue.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'vue-tabs-client.ts', contents: `import{createSSRApp,h} from'vue';import{TabsRoot,TabsList,TabsTab,TabsPanel}from'@vyrnforge/vue/tabs';const tabs=(id,options={})=>h(TabsRoot,{id,defaultValue:'overview',...options.root},()=>[h(TabsList,{'aria-label':options.label??'Account sections'},()=>[h(TabsTab,{value:'overview'},()=> 'Overview'),h(TabsTab,{value:'billing',disabled:true},()=> 'Billing'),h(TabsTab,{value:'security'},()=> 'Security'),...(options.activity===false?[]:[h(TabsTab,{value:'activity'},()=> 'Activity')])]),h(TabsPanel,{value:'overview'},()=> 'Overview panel'),h(TabsPanel,{value:'billing'},()=> 'Billing panel'),h(TabsPanel,{value:'security'},()=> 'Security panel'),...(options.activity===false?[]:[h(TabsPanel,{value:'activity'},()=> 'Activity panel')])]);const app=createSSRApp({render:()=>h('div',[tabs('vue-tabs',{root:{dir:'rtl',onValueChange:(value)=>document.body.dataset.value=value}}),tabs('vue-manual-tabs',{activity:false,label:'Manual vertical sections',root:{orientation:'vertical',activation:'manual',onValueChange:(value)=>document.body.dataset.manualValue=value}})])});app.mount('#vue-root');` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'vue.js') });
}

if (port === 'angular') {
  await import('@angular/compiler');
  const { Component, provideZonelessChangeDetection } = await import('@angular/core');
  const { bootstrapApplication, provideClientHydration } = await import('@angular/platform-browser');
  const { renderApplication } = await import('@angular/platform-server');
  const { VfTabsListDirective, VfTabsPanelDirective, VfTabsRootDirective, VfTabsTabDirective } = await import('@vyrnforge/angular/tabs');
  const template = '<div vfTabsRoot id="angular-tabs" defaultValue="overview" dir="rtl" (valueChange)="changed($event)"><div vfTabsList aria-label="Account sections"><button vfTabsTab="overview">Overview</button><button vfTabsTab="billing" disabled>Billing</button><button vfTabsTab="security">Security</button><button vfTabsTab="activity">Activity</button></div><div vfTabsPanel="overview">Overview panel</div><div vfTabsPanel="billing">Billing panel</div><div vfTabsPanel="security">Security panel</div><div vfTabsPanel="activity">Activity panel</div></div><div vfTabsRoot id="angular-manual-tabs" defaultValue="overview" orientation="vertical" activation="manual" (valueChange)="manualChanged($event)"><div vfTabsList aria-label="Manual vertical sections"><button vfTabsTab="overview">Overview</button><button vfTabsTab="billing" disabled>Billing</button><button vfTabsTab="security">Security</button></div><div vfTabsPanel="overview">Overview panel</div><div vfTabsPanel="billing">Billing panel</div><div vfTabsPanel="security">Security panel</div></div>';
  class TabsTestApp { changed(_value) {} manualChanged(_value) {} }
  Component({ selector: 'vf-tabs-test', standalone: true, imports: [VfTabsRootDirective, VfTabsListDirective, VfTabsTabDirective, VfTabsPanelDirective], template })(TabsTestApp);
  const html = await renderApplication((context) => bootstrapApplication(TabsTestApp, { providers: [provideZonelessChangeDetection(), provideClientHydration()] }, context), { document: '<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./tabs.css"></head><body><vf-tabs-test></vf-tabs-test></body></html>' });
  await writeFile(path.join(outDir, 'angular.html'), html.replace('</body>', '<script type="module" src="./angular.js"></script></body>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'angular-tabs-client.ts', contents: `import '@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication,provideClientHydration}from'@angular/platform-browser';import{VfTabsRootDirective,VfTabsListDirective,VfTabsTabDirective,VfTabsPanelDirective}from'@vyrnforge/angular/tabs';class App{changed(value){document.body.dataset.value=value}manualChanged(value){document.body.dataset.manualValue=value}}Component({selector:'vf-tabs-test',standalone:true,imports:[VfTabsRootDirective,VfTabsListDirective,VfTabsTabDirective,VfTabsPanelDirective],template:${JSON.stringify(template)}})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection(),provideClientHydration()]});` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'angular.js') });
}

if (port === 'elements') {
  const automatic = `
<vf-tabs id="elements-tabs" default-value="overview" dir="rtl">
  <div data-vf-tabs-list aria-label="Account sections">
    <button data-vf-tabs-tab data-vf-value="overview">Overview</button>
    <button data-vf-tabs-tab data-vf-value="billing" disabled>Billing</button>
    <button data-vf-tabs-tab data-vf-value="security">Security</button>
    <button data-vf-tabs-tab data-vf-value="activity">Activity</button>
  </div>
  <div data-vf-tabs-panel data-vf-value="overview">Overview panel</div>
  <div data-vf-tabs-panel data-vf-value="billing">Billing panel</div>
  <div data-vf-tabs-panel data-vf-value="security">Security panel</div>
  <div data-vf-tabs-panel data-vf-value="activity">Activity panel</div>
</vf-tabs>`;
  const manual = `
<vf-tabs id="elements-manual-tabs" default-value="overview" orientation="vertical" activation="manual">
  <div data-vf-tabs-list aria-label="Manual vertical sections">
    <button data-vf-tabs-tab data-vf-value="overview">Overview</button>
    <button data-vf-tabs-tab data-vf-value="billing" disabled>Billing</button>
    <button data-vf-tabs-tab data-vf-value="security">Security</button>
  </div>
  <div data-vf-tabs-panel data-vf-value="overview">Overview panel</div>
  <div data-vf-tabs-panel data-vf-value="billing">Billing panel</div>
  <div data-vf-tabs-panel data-vf-value="security">Security panel</div>
</vf-tabs>`;
  await writeFile(path.join(outDir, 'elements.html'), page(`${automatic}${manual}`, '<script type="module" src="./elements.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'elements-tabs-client.ts', contents: `import{defineTabsElement}from'@vyrnforge/elements/tabs';defineTabsElement();document.querySelector('#elements-tabs').addEventListener('vf-value-change',(event)=>{document.body.dataset.value=event.detail.value});document.querySelector('#elements-manual-tabs').addEventListener('vf-value-change',(event)=>{document.body.dataset.manualValue=event.detail.value});` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'elements.js') });
}
