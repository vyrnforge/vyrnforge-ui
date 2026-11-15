import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const page = (body, script = '', head = '') =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>File uploader browser fixture</title>${head}</head><body><main><h1>File uploader browser fixture</h1>${body}</main>${script}</body></html>`;

export const browserFixture = {
  component: 'file-uploader',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/file-uploader');
    await mkdir(dir, { recursive: true });

    if (port === 'web') {
      await build({
        stdin: {
          contents: '@import "@vyrnforge/web/styles/tokens.css";@import "@vyrnforge/web/styles/file-uploader.css";',
          resolveDir: root,
          sourcefile: 'file-uploader-public.css',
          loader: 'css',
        },
        bundle: true,
        outfile: path.join(dir, 'styles.css'),
      });
      await writeFile(
        path.join(dir, 'web.html'),
        page(
          '<form id="acquisition-form"><div data-vf-file-uploader-root><button id="dropzone" type="button" data-vf-file-uploader-dropzone>Choose or drop a file</button><input id="input" name="files" type="file" aria-label="Choose files"><ul id="list"></ul></div><button type="reset">Reset files</button></form>',
          '<script>function openPicker(){input.click()}function render(){list.innerHTML="";for(const f of input.files){const li=document.createElement("li");li.textContent=f.name;list.append(li)}}input.addEventListener("change",render);dropzone.addEventListener("click",openPicker);</script>',
          '<link rel="stylesheet" href="./styles.css">',
        ),
      );
      return;
    }

    if (port === 'react') {
      const entry = path.join(
        root,
        'product/components/composite-widgets/compound-fields/file-uploader/examples/import-recovery/react.tsx',
      );
      await build({
        entryPoints: [entry],
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outdir: dir,
        entryNames: 'react',
      });
      await writeFile(
        path.join(dir, 'react.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>File uploader import recovery fixture</title><link rel="stylesheet" href="./react.css"></head><body><div id="root"></div><script type="module" src="./react.js"></script></body></html>',
      );
      await writeFile(path.join(dir, 'acquisition-react.html'), page('<div id="app"></div>', '<script type="module" src="./acquisition-react.js"></script>'));
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'react-file-acquisition.ts',
          contents: `import{createElement as h}from'react';import{createRoot}from'react-dom/client';import{FileUploaderRoot,FileUploaderDropzone,FileUploaderInput,FileUploaderList}from'@vyrnforge/react/file-uploader';const record=files=>{document.body.dataset.files=files.map(f=>f.name).join(',');document.body.dataset.count=String(Number(document.body.dataset.count||0)+1)};createRoot(document.querySelector('#app')).render(h('form',{id:'acquisition-form'},h(FileUploaderRoot,{onFilesChange:record},h(FileUploaderDropzone,{id:'dropzone'},'Choose or drop a file'),h(FileUploaderInput,{id:'input',name:'files','aria-label':'Choose files'}),h(FileUploaderList,{id:'list'})),h('button',{type:'reset'},'Reset files')));`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'acquisition-react.js'),
      });
      return;
    }

    if (port === 'vue') {
      await writeFile(
        path.join(dir, 'vue.html'),
        page('<div id="app"></div>', '<script type="module" src="./vue.js"></script>'),
      );
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'vue-file-uploader-client.ts',
          contents: `import{createApp,h}from'vue';import{FileUploaderRoot,FileUploaderDropzone,FileUploaderInput,FileUploaderList}from'@vyrnforge/vue/file-uploader';const record=files=>{document.body.dataset.files=files.map(f=>f.name).join(',');document.body.dataset.count=String(Number(document.body.dataset.count||0)+1)};createApp({render:()=>h('form',{id:'acquisition-form'},[h(FileUploaderRoot,{onFilesChange:record},()=>[h(FileUploaderDropzone,{id:'dropzone'},()=> 'Choose or drop a file'),h(FileUploaderInput,{id:'input',name:'files','aria-label':'Choose files'}),h(FileUploaderList,{id:'list'})]),h('button',{type:'reset'},'Reset files')])}).mount('#app');`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'vue.js'),
      });
      return;
    }

    if (port === 'angular') {
      await writeFile(
        path.join(dir, 'angular.html'),
        page('<vf-file-uploader-test></vf-file-uploader-test>', '<script type="module" src="./angular.js"></script>'),
      );
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'angular-file-uploader-client.ts',
          contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{VfFileUploaderRootDirective,VfFileUploaderInputDirective,VfFileUploaderDropzoneDirective}from'@vyrnforge/angular/file-uploader';class App{files=[];record(files){this.files=files;document.body.dataset.files=files.map(f=>f.name).join(',');document.body.dataset.count=String(Number(document.body.dataset.count||0)+1)}}Component({selector:'vf-file-uploader-test',standalone:true,imports:[VfFileUploaderRootDirective,VfFileUploaderInputDirective,VfFileUploaderDropzoneDirective],template:'<form id="acquisition-form"><div vfFileUploaderRoot (filesChange)="record($event)"><button id="dropzone" vfFileUploaderDropzone>Choose or drop a file</button><input id="input" name="files" vfFileUploaderInput aria-label="Choose files"><ul id="list">@for (file of files; track $index) {<li>{{file.name}}</li>}</ul></div><button type="reset">Reset files</button></form>'})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'angular.js'),
      });
      return;
    }

    if (port === 'elements') {
      await writeFile(
        path.join(dir, 'elements.html'),
        page(
          '<form id="acquisition-form"><vf-file-uploader><button id="dropzone" type="button" data-vf-file-uploader-dropzone>Choose or drop a file</button><input id="input" name="files" type="file" aria-label="Choose files" data-vf-file-uploader-input><ul id="list"></ul></vf-file-uploader><button type="reset">Reset files</button></form>',
          '<script type="module" src="./elements.js"></script>',
        ),
      );
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'elements-file-uploader-client.ts',
          contents: `import{defineFileUploaderElement}from'@vyrnforge/elements/file-uploader';defineFileUploaderElement();document.querySelector('vf-file-uploader').addEventListener('vf-files-change',event=>{if(event.target!==event.currentTarget)return;document.body.dataset.files=event.detail.files.map(f=>f.name).join(',');document.body.dataset.count=String(Number(document.body.dataset.count||0)+1);const list=document.querySelector('#list');list.innerHTML='';for(const file of event.detail.files){const item=document.createElement('li');item.textContent=file.name;list.append(item);}});`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'elements.js'),
      });
    }
  },
};
