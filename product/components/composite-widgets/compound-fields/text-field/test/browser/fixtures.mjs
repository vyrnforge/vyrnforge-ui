import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'text-field',
  prepare: async ({ port }) => {
    if (!['web', 'react'].includes(port)) return false;
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/text-field');
    await mkdir(outDir, { recursive: true });
    const header =
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>TextField</title><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./' +
      port +
      '.css"><style>body{background:var(--vf-color-surface);color:var(--vf-color-text)} form{display:grid;gap:1rem;max-width:36rem}</style></head><body><main><h1>Fields</h1>';
    if (port === 'web') {
      await build({
        stdin: { contents: '@import "@vyrnforge/web/styles/text-field.css";', loader: 'css', resolveDir: root },
        bundle: true,
        outfile: path.join(outDir, 'web.css'),
      });
      await writeFile(
        path.join(outDir, 'web.html'),
        header +
          '<form><p id="external">External instruction.</p><div data-vf-text-field data-vf-text-field-full-width data-vf-text-field-variant="outlined"><label for="email" data-vf-text-field-label>Email</label><div data-vf-text-field-control data-vf-editor-surface><input id="email" data-vf-input data-vf-text-field-value data-vf-editor-variant="unstyled" name="email" value="original@example.com" type="email" required aria-describedby="external help error" aria-invalid="true"></div><div id="help" data-vf-text-field-description>Use your work address.</div><div id="error" data-vf-text-field-error>Choose another address.</div></div><div data-vf-text-field data-vf-text-field-full-width data-vf-text-field-variant="filled"><label for="notes" data-vf-text-field-label>Notes</label><div data-vf-text-field-control data-vf-editor-surface><textarea id="notes" name="notes" rows="3" data-vf-textarea data-vf-text-field-value data-vf-editor-variant="unstyled">Original notes</textarea></div></div><div data-vf-text-field data-vf-text-field-full-width data-vf-text-field-variant="outlined" data-vf-text-field-label-placement="floating"><div data-vf-text-field-control data-vf-editor-surface><label for="floating" data-vf-text-field-label>Floating email</label><fieldset data-vf-text-field-outline aria-hidden="true"><legend><span>Floating email</span></legend></fieldset><input id="floating" data-vf-input data-vf-text-field-value data-vf-editor-variant="unstyled" type="email" placeholder="name@example.com"></div></div><div data-vf-text-field data-vf-text-field-full-width data-vf-text-field-variant="filled" data-vf-text-field-label-placement="floating"><div data-vf-text-field-control data-vf-editor-surface><label for="compare-filled" data-vf-text-field-label>Compare filled</label><input id="compare-filled" data-vf-input data-vf-text-field-value data-vf-editor-variant="unstyled" value="Ada" placeholder=" "></div></div><div data-vf-text-field data-vf-text-field-full-width data-vf-text-field-variant="underlined" data-vf-text-field-label-placement="floating"><div data-vf-text-field-control data-vf-editor-surface><label for="compare-underlined" data-vf-text-field-label>Compare underlined</label><input id="compare-underlined" data-vf-input data-vf-text-field-value data-vf-editor-variant="unstyled" value="Ada" placeholder=" "></div></div><button type="reset">Reset</button></form></main></body></html>',
      );
    } else {
      const source = `
import {createElement as h,useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {TextField} from '@vyrnforge/react/text-field';
import {Button} from '@vyrnforge/react/button';
import {createTheme,renderThemeCss} from '@vyrnforge/web/theme';
const theme = createTheme({name:'field-test', tokens:{'--vf-text-field-label-font':'600 18px/1.5 sans-serif','--vf-text-field-radius':'12px'}});
const style=document.createElement('style');style.textContent=renderThemeCss(theme);document.head.append(style);
function App(){
  const [value,setValue]=useState('controlled');
  const [submitted,setSubmitted]=useState('');
  const ref=useRef(null);
  return h('form',{onReset:()=>setValue('controlled'),onSubmit:e=>{e.preventDefault();setSubmitted(new FormData(e.currentTarget).get('email'));}},
    h('p',{id:'external'},'External instruction.'),
    h(TextField,{id:'email',label:'Email',name:'email',type:'email',required:true,defaultValue:'original@example.com',description:'Use your work address.',error:'Choose another address.','aria-describedby':'external external',fullWidth:true}),
    h(TextField,{label:'Notes',name:'notes',multiline:true,rows:3,defaultValue:'Original notes',variant:'filled',fullWidth:true}),
    h(TextField,{label:'Auto message',name:'message',autosize:true,minRows:1,maxRows:4,defaultValue:'Original message',fullWidth:true}),
    h(TextField,{label:'Controlled',name:'controlled',ref,value,onChange:e=>setValue(e.currentTarget.value),fullWidth:true,trailing:h(Button,{type:'button',size:'sm',variant:'ghost',onClick:()=>{setValue('');ref.current.focus();}},'Clear')}),
    h(TextField,{label:'Disabled',disabled:true,error:'Not available',defaultValue:'disabled',name:'disabled'}),
    h(TextField,{label:'Read only',readOnly:true,name:'readonly',defaultValue:'kept'}),
    h(TextField,{id:'floating',label:'Floating email',labelPlacement:'floating',type:'email',placeholder:'name@example.com',fullWidth:true}),
    h(TextField,{label:'Floating filled',labelPlacement:'floating',variant:'filled',defaultValue:'Ada',fullWidth:true}),
    h(TextField,{label:'Floating underlined',labelPlacement:'floating',variant:'underlined',fullWidth:true}),
    h(TextField,{label:'Compare filled',labelPlacement:'floating',variant:'filled',defaultValue:'Ada',fullWidth:true}),
    h(TextField,{label:'Compare underlined',labelPlacement:'floating',variant:'underlined',defaultValue:'Ada',fullWidth:true}),
    h(Button,{type:'submit'},'Submit'),h(Button,{type:'reset'},'Reset'),h('output',null,submitted));
}
createRoot(document.querySelector('#root')).render(h(App));
`;
      await build({
        stdin: { contents: source, resolveDir: root, sourcefile: 'text-field-client.ts' },
        bundle: true,
        platform: 'browser',
        format: 'iife',
        outfile: path.join(outDir, 'react.js'),
      });
      await writeFile(
        path.join(outDir, 'react.html'),
        header + '<div id="root"></div></main><script src="./react.js"></script></body></html>',
      );
    }
    return true;
  },
};
