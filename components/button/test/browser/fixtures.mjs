import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2] || 'web';
const root = process.cwd();
const outDir = path.join(root, 'dist/docs/next/button-fixtures');
await mkdir(outDir, { recursive: true });

const buttonCss = await readFile(path.join(root, 'packages/web/dist/components/button/button.css'), 'utf8');
const tokenCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
await writeFile(path.join(outDir, 'button.css'), `${tokenCss}\n${buttonCss.replace('@import "../../styles/tokens.css";', '')}`);
const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./button.css"><title>Button fixture</title></head><body>${body}${script}</body></html>`;

if (port === 'web') {
  await writeFile(path.join(outDir, 'web.html'), page(`
    <main>
      <h1>Button contract fixture</h1>
      <section data-visual-matrix aria-label="Button visual states">
        <button data-vf-button data-vf-variant="primary" data-vf-size="sm">Primary small</button>
        <button data-vf-button data-vf-variant="secondary" data-vf-size="md">Secondary medium</button>
        <button data-vf-button data-vf-variant="ghost" data-vf-size="lg">Ghost large</button>
        <button data-vf-button data-vf-variant="primary" data-vf-size="md" data-vf-loading aria-busy="true">Loading</button>
        <button data-vf-button data-vf-variant="primary" data-vf-size="md" disabled>Disabled</button>
      </section>
      <form id="form"><label for="field">Field</label><input id="field" name="field" value="changed"><button id="submit" data-vf-button data-vf-variant="primary" data-vf-size="md">Submit</button><button id="reset" data-vf-button data-vf-variant="secondary" data-vf-size="md" type="reset">Reset</button><button id="plain" data-vf-button data-vf-variant="ghost" data-vf-size="md" type="button">Plain</button></form>
      <button id="activation" data-vf-button data-vf-variant="primary" data-vf-size="md">Activate</button>
      <button id="busy" data-vf-button data-vf-variant="primary" data-vf-size="md" data-vf-loading aria-busy="true">Busy action</button>
      <button id="disabled" data-vf-button data-vf-variant="primary" data-vf-size="md" disabled>Disabled action</button>
    </main>`, `<script>let activations=0;document.querySelector('#activation').addEventListener('click',()=>document.body.dataset.activations=String(++activations));document.querySelector('#busy').addEventListener('click',()=>document.body.dataset.busyActivated='true');document.querySelector('#form').addEventListener('submit',event=>{event.preventDefault();document.body.dataset.submitted='true'});</script>`));
}

if (port === 'react') {
  const { createElement } = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { Button } = await import('@vyrnforge/react/button');
  const markup = renderToString(createElement(Button, { loading: true, id: 'react-button' }, 'React action'));
  await writeFile(path.join(outDir, 'react.html'), page(`<div id="react-root">${markup}</div>`, '<script type="module" src="./react.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'react-button-client.ts', contents: `import {createElement} from 'react';import {hydrateRoot} from 'react-dom/client';import {Button} from '@vyrnforge/react/button';hydrateRoot(document.querySelector('#react-root'),createElement(Button,{loading:true,id:'react-button',onClick:()=>document.body.dataset.activated='true'},'React action'));` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'react.js') });
}

if (port === 'vue') {
  const { createSSRApp, h } = await import('vue');
  const { renderToString } = await import('@vue/server-renderer');
  const { Button } = await import('@vyrnforge/vue/button');
  const app = createSSRApp({ render: () => h(Button, { loading: true, id: 'vue-button', onClick: () => undefined }, () => 'Vue action') });
  const markup = await renderToString(app);
  await writeFile(path.join(outDir, 'vue.html'), page(`<div id="vue-root">${markup}</div>`, '<script type="module" src="./vue.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'vue-button-client.ts', contents: `import {createSSRApp,h} from 'vue';import {Button} from '@vyrnforge/vue/button';const app=createSSRApp({render:()=>h(Button,{loading:true,id:'vue-button',onClick:()=>document.body.dataset.activated='true'},()=> 'Vue action')});app.mount('#vue-root');` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'vue.js') });
}

if (port === 'angular') {
  await import('@angular/compiler');
  const { Component, provideZonelessChangeDetection } = await import('@angular/core');
  const { bootstrapApplication, provideClientHydration } = await import('@angular/platform-browser');
  const { renderApplication } = await import('@angular/platform-server');
  const { VfButtonDirective } = await import('@vyrnforge/angular/button');
  class ButtonTestApp { activated() { return undefined; } }
  Component({ selector: 'vf-button-test', standalone: true, imports: [VfButtonDirective], template: '<button vfButton loading id="angular-button" (click)="activated()">Angular action</button>' })(ButtonTestApp);
  const html = await renderApplication((context) => bootstrapApplication(ButtonTestApp, { providers: [provideZonelessChangeDetection(), provideClientHydration()] }, context), { document: '<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./button.css"></head><body><vf-button-test></vf-button-test></body></html>' });
  await writeFile(path.join(outDir, 'angular.html'), html.replace('</body>', '<script type="module" src="./angular.js"></script></body>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'angular-button-client.ts', contents: `import '@angular/compiler';import {Component,provideZonelessChangeDetection} from '@angular/core';import {bootstrapApplication,provideClientHydration} from '@angular/platform-browser';import {VfButtonDirective} from '@vyrnforge/angular/button';class ButtonTestApp{activated(){document.body.dataset.activated='true'}}Component({selector:'vf-button-test',standalone:true,imports:[VfButtonDirective],template:'<button vfButton loading id="angular-button" (click)="activated()">Angular action</button>'})(ButtonTestApp);bootstrapApplication(ButtonTestApp,{providers:[provideZonelessChangeDetection(),provideClientHydration()]});` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'angular.js') });
}
