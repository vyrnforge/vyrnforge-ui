import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2] || 'web';
const root = process.cwd();
const outDir = path.join(root, 'dist/docs/next/combobox-fixtures');
await mkdir(outDir, { recursive: true });

const comboboxCss = await readFile(path.join(root, 'packages/web/dist/components/combobox/combobox.css'), 'utf8');
const tokenCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
await writeFile(path.join(outDir, 'combobox.css'), `${tokenCss}\n${comboboxCss.replace('@import "../../styles/tokens.css";', '')}`);
const page = (body, script = '') => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./combobox.css"><title>Combobox fixture</title></head><body><main><h1>Combobox browser fixture</h1><button id="before">Before</button>${body}<button id="after">After</button></main>${script}</body></html>`;

const options = (prefix) => [
  { id: `${prefix}-react`, value: 'React', label: 'React' },
  { id: `${prefix}-angular`, value: 'Angular', label: 'Angular', disabled: true },
  { id: `${prefix}-vue`, value: 'Vue', label: 'Vue' },
  { id: `${prefix}-svelte`, value: 'Svelte', label: 'Svelte' },
];
const localeOptions = (prefix) => [
  { id: `${prefix}-istanbul`, value: 'İstanbul', label: 'İstanbul' },
  { id: `${prefix}-isparta`, value: 'Isparta', label: 'Isparta' },
];

if (port === 'web') {
  const markup = `<input id="web-input" aria-label="Framework" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="web-listbox" data-vf-combobox-input><div id="web-listbox" role="listbox" aria-labelledby="web-input" aria-label="Framework options" data-vf-combobox-content>${options('web').map((option) => `<button id="${option.id}" type="button" role="option" tabindex="-1" aria-selected="false"${option.disabled ? ' disabled aria-disabled="true"' : ''} data-vf-combobox-option data-vf-text-value="${option.label}">${option.label}</button>`).join('')}</div>`;
  await writeFile(path.join(outDir, 'web.html'), page(markup));
}

if (port === 'react') {
  await writeFile(path.join(outDir, 'react.html'), page('<div id="app"></div>', '<script type="module" src="./react.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'react-combobox-client.ts', contents: `import{createElement}from'react';import{createRoot}from'react-dom/client';import{ComboboxRoot,ComboboxInput,ComboboxContent,ComboboxOption}from'@vyrnforge/react/combobox';const items=${JSON.stringify(options('react'))};const localeItems=${JSON.stringify(localeOptions('react-locale'))};const combo=(props,items,label)=>createElement(ComboboxRoot,props,createElement(ComboboxInput,{'aria-label':label}),createElement(ComboboxContent,{'aria-label':label+' options'},items.map(item=>createElement(ComboboxOption,{key:item.id,id:item.id,value:item.value,textValue:item.label,disabled:item.disabled},item.label))));createRoot(document.querySelector('#app')).render(createElement('div',null,combo({},items,'Framework'),combo({locale:'tr'},localeItems,'Turkish city')));` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'react.js') });
}

if (port === 'vue') {
  await writeFile(path.join(outDir, 'vue.html'), page('<div id="app"></div>', '<script type="module" src="./vue.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'vue-combobox-client.ts', contents: `import{createApp,h}from'vue';import{ComboboxRoot,ComboboxInput,ComboboxContent,ComboboxOption}from'@vyrnforge/vue/combobox';const items=${JSON.stringify(options('vue'))};const localeItems=${JSON.stringify(localeOptions('vue-locale'))};const combo=(props,items,label)=>h(ComboboxRoot,props,()=>[h(ComboboxInput,{'aria-label':label}),h(ComboboxContent,{'aria-label':label+' options'},()=>items.map(item=>h(ComboboxOption,{id:item.id,value:item.value,textValue:item.label,disabled:item.disabled},()=>item.label)))]);createApp({render:()=>h('div',null,[combo({},items,'Framework'),combo({locale:'tr'},localeItems,'Turkish city')])}).mount('#app');` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'vue.js') });
}

if (port === 'angular') {
  await writeFile(path.join(outDir, 'angular.html'), page('<vf-combobox-test></vf-combobox-test>', '<script type="module" src="./angular.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'angular-combobox-client.ts', contents: `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{VfComboboxRootDirective,VfComboboxInputDirective,VfComboboxContentDirective,VfComboboxOptionDirective}from'@vyrnforge/angular/combobox';class App{}Component({selector:'vf-combobox-test',standalone:true,imports:[VfComboboxRootDirective,VfComboboxInputDirective,VfComboboxContentDirective,VfComboboxOptionDirective],template:'<div vfComboboxRoot><input vfComboboxInput aria-label="Framework"><div vfComboboxContent aria-label="Framework options"><button vfComboboxOption="React" id="angular-react" textValue="React">React</button><button vfComboboxOption="Angular" id="angular-angular" textValue="Angular" [disabled]="true">Angular</button><button vfComboboxOption="Vue" id="angular-vue" textValue="Vue">Vue</button><button vfComboboxOption="Svelte" id="angular-svelte" textValue="Svelte">Svelte</button></div></div><div vfComboboxRoot locale="tr"><input vfComboboxInput aria-label="Turkish city"><div vfComboboxContent aria-label="Turkish city options"><button vfComboboxOption="İstanbul" id="angular-locale-istanbul" textValue="İstanbul">İstanbul</button><button vfComboboxOption="Isparta" id="angular-locale-isparta" textValue="Isparta">Isparta</button></div></div>'})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'angular.js') });
}

if (port === 'elements') {
  const markup = `<vf-combobox><input id="elements-input" aria-label="Framework" data-vf-combobox-input><div id="elements-listbox" aria-label="Framework options" data-vf-combobox-content><button id="elements-react" type="button" data-vf-combobox-option data-value="React" data-vf-text-value="React">React</button><button id="elements-angular" type="button" data-vf-combobox-option data-value="Angular" data-vf-text-value="Angular" disabled>Angular</button><button id="elements-vue" type="button" data-vf-combobox-option data-value="Vue" data-vf-text-value="Vue">Vue</button><button id="elements-svelte" type="button" data-vf-combobox-option data-value="Svelte" data-vf-text-value="Svelte">Svelte</button></div></vf-combobox><vf-combobox locale="tr"><input aria-label="Turkish city" data-vf-combobox-input><div aria-label="Turkish city options" data-vf-combobox-content><button id="elements-locale-istanbul" type="button" data-vf-combobox-option data-value="İstanbul" data-vf-text-value="İstanbul">İstanbul</button><button id="elements-locale-isparta" type="button" data-vf-combobox-option data-value="Isparta" data-vf-text-value="Isparta">Isparta</button></div></vf-combobox>`;
  await writeFile(path.join(outDir, 'elements.html'), page(markup, '<script type="module" src="./elements.js"></script>'));
  await build({ stdin: { resolveDir: root, sourcefile: 'elements-combobox-client.ts', contents: `import{defineComboboxElement}from'@vyrnforge/elements/combobox';defineComboboxElement();` }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, 'elements.js') });
}
