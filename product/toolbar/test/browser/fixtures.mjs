import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2] || 'react';
const root = process.cwd();
const outDir = path.join(root, 'dist/docs/next/toolbar-fixtures');
await mkdir(outDir, { recursive: true });

const toolbarCss = await readFile(path.join(root, 'packages/web/dist/components/toolbar/toolbar.css'), 'utf8');
const tokenCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
await writeFile(path.join(outDir, 'toolbar.css'), `${tokenCss}\n${toolbarCss.replace('@import "../../styles/tokens.css";', '')}`);
const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./toolbar.css"><title>Toolbar fixture</title></head><body><main><h1>Toolbar browser fixture</h1>${body}</main>${script}</body></html>`;

const ids = {
  horizontal: { root: 'toolbar', before: 'before', bold: 'bold', disabled: 'disabled', italic: 'italic', link: 'link', after: 'after' },
  vertical: { root: 'vertical-toolbar', one: 'vertical-one', disabled: 'vertical-disabled', three: 'vertical-three' },
};

if (port === 'web') {
  const markup = `<button id="before">Before</button><div id="toolbar" role="toolbar" aria-label="Formatting" aria-orientation="horizontal" data-vf-toolbar-root data-vf-orientation="horizontal" dir="rtl"><button id="bold" data-vf-toolbar-item>Bold</button><button id="disabled" data-vf-toolbar-item disabled>Disabled</button><button id="italic" data-vf-toolbar-item>Italic</button><span data-vf-toolbar-separator role="separator"></span><a id="link" data-vf-toolbar-item href="#target">Help</a></div><button id="after">After</button><div id="vertical-toolbar" role="toolbar" aria-label="Vertical tools" aria-orientation="vertical" data-vf-toolbar-root data-vf-orientation="vertical"><button id="vertical-one" data-vf-toolbar-item>One</button><button id="vertical-disabled" data-vf-toolbar-item disabled>Disabled</button><button id="vertical-three" data-vf-toolbar-item>Three</button></div><div id="target">Target</div>`;
  await writeFile(path.join(outDir, 'web.html'), page(markup));
}

if (port === 'react') {
  const { createElement, Fragment } = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { ToolbarButton, ToolbarLink, ToolbarRoot, ToolbarSeparator } = await import('@vyrnforge/react/toolbar');
  const app = createElement(Fragment, null,
    createElement('button', { id: ids.horizontal.before }, 'Before'),
    createElement(ToolbarRoot, { id: ids.horizontal.root, 'aria-label': 'Formatting', dir: 'rtl' },
      createElement(ToolbarButton, { id: ids.horizontal.bold }, 'Bold'),
      createElement(ToolbarButton, { id: ids.horizontal.disabled, disabled: true }, 'Disabled'),
      createElement(ToolbarButton, { id: ids.horizontal.italic }, 'Italic'),
      createElement(ToolbarSeparator),
      createElement(ToolbarLink, { id: ids.horizontal.link, href: '#target' }, 'Help')),
    createElement('button', { id: ids.horizontal.after }, 'After'),
    createElement(ToolbarRoot, { id: ids.vertical.root, 'aria-label': 'Vertical tools', orientation: 'vertical' },
      createElement(ToolbarButton, { id: ids.vertical.one }, 'One'),
      createElement(ToolbarButton, { id: ids.vertical.disabled, disabled: true }, 'Disabled'),
      createElement(ToolbarButton, { id: ids.vertical.three }, 'Three')),
    createElement('div', { id: 'target' }, 'Target'));
  const markup = renderToString(app);
  await writeFile(path.join(outDir, 'react.html'), page(`<div id="react-root">${markup}</div>`, '<script type="module" src="./react.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'react-toolbar-client.ts', contents: `import{createElement,Fragment}from'react';import{hydrateRoot}from'react-dom/client';import{ToolbarRoot,ToolbarButton,ToolbarLink,ToolbarSeparator}from'@vyrnforge/react/toolbar';const app=createElement(Fragment,null,createElement('button',{id:'before'},'Before'),createElement(ToolbarRoot,{id:'toolbar','aria-label':'Formatting',dir:'rtl'},createElement(ToolbarButton,{id:'bold'},'Bold'),createElement(ToolbarButton,{id:'disabled',disabled:true},'Disabled'),createElement(ToolbarButton,{id:'italic'},'Italic'),createElement(ToolbarSeparator),createElement(ToolbarLink,{id:'link',href:'#target'},'Help')),createElement('button',{id:'after'},'After'),createElement(ToolbarRoot,{id:'vertical-toolbar','aria-label':'Vertical tools',orientation:'vertical'},createElement(ToolbarButton,{id:'vertical-one'},'One'),createElement(ToolbarButton,{id:'vertical-disabled',disabled:true},'Disabled'),createElement(ToolbarButton,{id:'vertical-three'},'Three')),createElement('div',{id:'target'},'Target'));hydrateRoot(document.querySelector('#react-root'),app);` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'react.js') });
}

if (port === 'vue') {
  const { createSSRApp, h } = await import('vue');
  const { renderToString } = await import('@vue/server-renderer');
  const { ToolbarButton, ToolbarLink, ToolbarRoot, ToolbarSeparator } = await import('@vyrnforge/vue/toolbar');
  const render = () => h('div', [
    h('button', { id: ids.horizontal.before }, 'Before'),
    h(ToolbarRoot, { id: ids.horizontal.root, 'aria-label': 'Formatting', dir: 'rtl' }, () => [
      h(ToolbarButton, { id: ids.horizontal.bold }, () => 'Bold'), h(ToolbarButton, { id: ids.horizontal.disabled, disabled: true }, () => 'Disabled'), h(ToolbarButton, { id: ids.horizontal.italic }, () => 'Italic'), h(ToolbarSeparator), h(ToolbarLink, { id: ids.horizontal.link, href: '#target' }, () => 'Help')]),
    h('button', { id: ids.horizontal.after }, 'After'),
    h(ToolbarRoot, { id: ids.vertical.root, 'aria-label': 'Vertical tools', orientation: 'vertical' }, () => [h(ToolbarButton, { id: ids.vertical.one }, () => 'One'), h(ToolbarButton, { id: ids.vertical.disabled, disabled: true }, () => 'Disabled'), h(ToolbarButton, { id: ids.vertical.three }, () => 'Three')]),
    h('div', { id: 'target' }, 'Target'),
  ]);
  const markup = await renderToString(createSSRApp({ render }));
  await writeFile(path.join(outDir, 'vue.html'), page(`<div id="vue-root">${markup}</div>`, '<script type="module" src="./vue.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'vue-toolbar-client.ts', contents: `import{createSSRApp,h}from'vue';import{ToolbarRoot,ToolbarButton,ToolbarLink,ToolbarSeparator}from'@vyrnforge/vue/toolbar';const app=createSSRApp({render:()=>h('div',[h('button',{id:'before'},'Before'),h(ToolbarRoot,{id:'toolbar','aria-label':'Formatting',dir:'rtl'},()=>[h(ToolbarButton,{id:'bold'},()=> 'Bold'),h(ToolbarButton,{id:'disabled',disabled:true},()=> 'Disabled'),h(ToolbarButton,{id:'italic'},()=> 'Italic'),h(ToolbarSeparator),h(ToolbarLink,{id:'link',href:'#target'},()=> 'Help')]),h('button',{id:'after'},'After'),h(ToolbarRoot,{id:'vertical-toolbar','aria-label':'Vertical tools',orientation:'vertical'},()=>[h(ToolbarButton,{id:'vertical-one'},()=> 'One'),h(ToolbarButton,{id:'vertical-disabled',disabled:true},()=> 'Disabled'),h(ToolbarButton,{id:'vertical-three'},()=> 'Three')]),h('div',{id:'target'},'Target')])});app.mount('#vue-root');` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'vue.js') });
}

if (port === 'angular') {
  await import('@angular/compiler');
  const { Component, provideZonelessChangeDetection } = await import('@angular/core');
  const { bootstrapApplication, provideClientHydration } = await import('@angular/platform-browser');
  const { renderApplication } = await import('@angular/platform-server');
  const { VfToolbarButtonDirective, VfToolbarLinkDirective, VfToolbarRootDirective, VfToolbarSeparatorDirective } = await import('@vyrnforge/angular/toolbar');
  const template = '<button id="before">Before</button><div vfToolbarRoot id="toolbar" aria-label="Formatting" dir="rtl"><button vfToolbarButton id="bold">Bold</button><button vfToolbarButton id="disabled" disabled>Disabled</button><button vfToolbarButton id="italic">Italic</button><span vfToolbarSeparator></span><a vfToolbarLink id="link" href="#target">Help</a></div><button id="after">After</button><div vfToolbarRoot id="vertical-toolbar" aria-label="Vertical tools" orientation="vertical"><button vfToolbarButton id="vertical-one">One</button><button vfToolbarButton id="vertical-disabled" disabled>Disabled</button><button vfToolbarButton id="vertical-three">Three</button></div><div id="target">Target</div>';
  class ToolbarTestApp {}
  Component({ selector: 'vf-toolbar-test', standalone: true, imports: [VfToolbarRootDirective, VfToolbarButtonDirective, VfToolbarLinkDirective, VfToolbarSeparatorDirective], template })(ToolbarTestApp);
  const html = await renderApplication((context) => bootstrapApplication(ToolbarTestApp, { providers: [provideZonelessChangeDetection(), provideClientHydration()] }, context), { document: '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./toolbar.css"><title>Toolbar fixture</title></head><body><main><h1>Toolbar browser fixture</h1><vf-toolbar-test></vf-toolbar-test></main></body></html>' });
  await writeFile(path.join(outDir, 'angular.html'), html.replace('</body>', '<script type="module" src="./angular.js"></script></body>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'angular-toolbar-client.ts', contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication,provideClientHydration}from'@angular/platform-browser';import{VfToolbarRootDirective,VfToolbarButtonDirective,VfToolbarLinkDirective,VfToolbarSeparatorDirective}from'@vyrnforge/angular/toolbar';const template=${JSON.stringify(template)};class App{}Component({selector:'vf-toolbar-test',standalone:true,imports:[VfToolbarRootDirective,VfToolbarButtonDirective,VfToolbarLinkDirective,VfToolbarSeparatorDirective],template})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection(),provideClientHydration()]});` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'angular.js') });
}

if (port === 'elements') {
  const markup = `<button id="before">Before</button><vf-toolbar id="toolbar" aria-label="Formatting" dir="rtl"><button id="bold" data-vf-toolbar-item>Bold</button><button id="disabled" data-vf-toolbar-item disabled>Disabled</button><button id="italic" data-vf-toolbar-item>Italic</button><span data-vf-toolbar-separator role="separator"></span><a id="link" data-vf-toolbar-item href="#target">Help</a></vf-toolbar><button id="after">After</button><vf-toolbar id="vertical-toolbar" aria-label="Vertical tools" orientation="vertical"><button id="vertical-one" data-vf-toolbar-item>One</button><button id="vertical-disabled" data-vf-toolbar-item disabled>Disabled</button><button id="vertical-three" data-vf-toolbar-item>Three</button></vf-toolbar><div id="target">Target</div>`;
  await writeFile(path.join(outDir, 'elements.html'), page(markup, '<script type="module" src="./elements.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'elements-toolbar-client.ts', contents: `import{defineToolbarElement}from'@vyrnforge/elements/toolbar';defineToolbarElement();` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'elements.js') });
}
