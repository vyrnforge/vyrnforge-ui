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
          '<div data-vf-file-uploader-root><div id="dropzone" role="button" tabindex="0" data-vf-file-uploader-dropzone>Choose or drop a file</div><input id="input" type="file" aria-label="Choose files"><ul id="list"></ul></div>',
          '<script>function openPicker(){input.click()}function render(){list.innerHTML="";for(const f of input.files){const li=document.createElement("li");li.textContent=f.name;list.append(li)}}input.addEventListener("change",render);dropzone.addEventListener("click",openPicker);dropzone.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openPicker()}});</script>',
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
          contents: `import{createApp,h}from'vue';import{FileUploaderRoot,FileUploaderDropzone,FileUploaderInput,FileUploaderList}from'@vyrnforge/vue/file-uploader';createApp({render:()=>h(FileUploaderRoot,null,()=>[h(FileUploaderDropzone,{id:'dropzone'},()=> 'Choose or drop a file'),h(FileUploaderInput,{id:'input','aria-label':'Choose files'}),h(FileUploaderList,{id:'list'})])}).mount('#app');`,
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
          contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{VfFileUploaderRootDirective,VfFileUploaderInputDirective,VfFileUploaderDropzoneDirective}from'@vyrnforge/angular/file-uploader';class App{files=[];}Component({selector:'vf-file-uploader-test',standalone:true,imports:[VfFileUploaderRootDirective,VfFileUploaderInputDirective,VfFileUploaderDropzoneDirective],template:'<div vfFileUploaderRoot (filesChange)="files=$event"><div id="dropzone" vfFileUploaderDropzone>Choose or drop a file</div><input id="input" vfFileUploaderInput aria-label="Choose files"><ul id="list">@for (file of files; track $index) {<li>{{file.name}}</li>}</ul></div>'})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});`,
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
          '<vf-file-uploader><div id="dropzone" data-vf-file-uploader-dropzone>Choose or drop a file</div><input id="input" type="file" aria-label="Choose files" data-vf-file-uploader-input><ul id="list"></ul></vf-file-uploader>',
          '<script type="module" src="./elements.js"></script>',
        ),
      );
      await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'elements-file-uploader-client.ts',
          contents: `import{defineFileUploaderElement}from'@vyrnforge/elements/file-uploader';defineFileUploaderElement();document.querySelector('vf-file-uploader').addEventListener('vf-files-change',event=>{const list=document.querySelector('#list');list.innerHTML='';for(const file of event.detail.files){const item=document.createElement('li');item.textContent=file.name;list.append(item);}});`,
        },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outfile: path.join(dir, 'elements.js'),
      });
    }
  },
};
