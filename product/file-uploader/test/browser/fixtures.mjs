import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2];
const root = process.cwd();
const dir = path.join(root, 'dist/browser-fixtures/components/file-uploader');
await mkdir(dir, { recursive: true });

if (port === 'react') {
  const entry = path.join(root, 'product/file-uploader/examples/import-recovery/react.tsx');
  await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'browser', outdir: dir, entryNames: 'react' });
  await writeFile(
    path.join(dir, 'react.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>File uploader import recovery fixture</title><link rel="stylesheet" href="./react.css"></head><body><div id="root"></div><script type="module" src="./react.js"></script></body></html>',
  );
} else {
  await writeFile(
    path.join(dir, `${port}.html`),
    '<!doctype html><html lang="en"><head><title>File uploader browser fixture</title></head><body><main><h1>File uploader browser fixture</h1><div data-vf-file-uploader-root><div id="dropzone" role="button" tabindex="0">Choose or drop a file</div><input id="input" type="file" aria-label="Choose files"><ul id="list"></ul></div></main><script>input.addEventListener("change",()=>{list.innerHTML="";for(const f of input.files){const li=document.createElement("li");li.textContent=f.name;list.append(li)}});dropzone.addEventListener("click",()=>input.click());</script></body></html>',
  );
}
