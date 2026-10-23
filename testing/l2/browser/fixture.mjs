import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const definitions = {
  link: { exportName: 'Link', angularName: 'VfLinkDirective', markup: '<a id="control" data-vf-link href="#target">Example link</a><div id="target">Target</div>', angular: '<a id="control" vfLink href="#target">Example link</a><div id="target">Target</div>', label: false },
  'toggle-button': { exportName: 'ToggleButton', angularName: 'VfToggleButtonDirective', markup: '<button id="control" type="button" data-vf-button data-vf-toggle-button aria-pressed="false">Toggle</button>', angular: '<button id="control" vfToggleButton>Toggle</button>', label: false, hydrate: true },
  'number-input': { exportName: 'NumberInput', angularName: 'VfNumberInputDirective', markup: '<label for="control">Number</label><input id="control" name="control" type="number" data-vf-number-input value="42" min="0" max="100">', angular: '<label for="control">Number</label><input id="control" name="control" vfNumberInput value="42" min="0" max="100">', props: { name: 'control', defaultValue: 42, min: 0, max: 100 } },
  checkbox: { exportName: 'Checkbox', angularName: 'VfCheckboxDirective', markup: '<label for="control">Choice</label><input id="control" name="control" type="checkbox" data-vf-checkbox data-vf-indeterminate>', angular: '<label for="control">Choice</label><input id="control" name="control" vfCheckbox [indeterminate]="true">', props: { name: 'control', indeterminate: true }, hydrate: true },
  radio: { exportName: 'Radio', angularName: 'VfRadioDirective', markup: '<label for="control">Choice</label><input id="control" name="choice" value="one" type="radio" data-vf-radio checked>', angular: '<label for="control">Choice</label><input id="control" name="choice" value="one" vfRadio checked>', props: { name: 'choice', value: 'one', defaultChecked: true } },
  switch: { exportName: 'Switch', angularName: 'VfSwitchDirective', markup: '<label for="control">Enabled</label><input id="control" name="enabled" type="checkbox" role="switch" data-vf-switch>', angular: '<label for="control">Enabled</label><input id="control" name="enabled" vfSwitch>', props: { name: 'enabled' } },
  'native-select': { exportName: 'NativeSelect', angularName: 'VfNativeSelectDirective', markup: '<label for="control">Option</label><select id="control" name="control" data-vf-native-select><option value="one">One</option><option value="two" selected>Two</option></select>', angular: '<label for="control">Option</label><select id="control" name="control" vfNativeSelect><option value="one">One</option><option value="two" selected>Two</option></select>', props: { name: 'control', defaultValue: 'two' }, select: true },
  slider: { exportName: 'Slider', angularName: 'VfSliderDirective', markup: '<label for="control">Value</label><input id="control" name="control" type="range" data-vf-slider value="50" min="0" max="100">', angular: '<label for="control">Value</label><input id="control" name="control" vfSlider value="50" min="0" max="100">', props: { name: 'control', defaultValue: 50, min: 0, max: 100 } },
  'file-input': { exportName: 'FileInput', angularName: 'VfFileInputDirective', markup: '<label for="control">File</label><input id="control" name="upload" type="file" data-vf-file-input>', angular: '<label for="control">File</label><input id="control" name="upload" vfFileInput>', props: { name: 'upload' } },
  'color-input': { exportName: 'ColorInput', angularName: 'VfColorInputDirective', markup: '<label for="control">Color</label><input id="control" name="color" type="color" data-vf-color-input value="#2563eb">', angular: '<label for="control">Color</label><input id="control" name="color" vfColorInput value="#2563eb">', props: { name: 'color', defaultValue: '#2563eb' } },
  'temporal-input': { exportName: 'TemporalInput', angularName: 'VfTemporalInputDirective', markup: '<label for="control">Date</label><input id="control" name="date" type="date" data-vf-temporal-input value="2026-01-21">', angular: '<label for="control">Date</label><input id="control" name="date" vfTemporalInput type="date" value="2026-01-21">', props: { name: 'date', type: 'date', defaultValue: '2026-01-21' } },
};

function page(componentId, body, script = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./${componentId}.css"><title>${componentId} fixture</title></head><body><main><h1>${componentId} fixture</h1>${body}</main>${script}</body></html>`;
}

function reactControlSource(componentId, definition) {
  const name = definition.exportName;
  if (componentId === 'toggle-button') return `createElement(${name},{id:'control',defaultPressed:false},'Toggle')`;
  if (componentId === 'checkbox') return `createElement(${name},{id:'control',name:'control',indeterminate:true})`;
  throw new Error(`No React hydration source for ${componentId}`);
}
function vueControlSource(componentId, definition) {
  const name = definition.exportName;
  if (componentId === 'toggle-button') return `h(${name},{id:'control',defaultPressed:false},()=> 'Toggle')`;
  if (componentId === 'checkbox') return `h(${name},{id:'control',name:'control',indeterminate:true})`;
  throw new Error(`No Vue hydration source for ${componentId}`);
}

async function writeClient(outDir, fileName, source, root) {
  await build({ stdin: { resolveDir: root, sourcefile: fileName, contents: source }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, fileName.replace(/\.ts$/, '.js')) });
}

export async function buildL2BrowserFixture(componentId, port) {
  const definition = definitions[componentId];
  if (!definition) throw new Error(`Unknown Layer 2 component: ${componentId}`);
  if (!['web', 'react', 'angular', 'vue'].includes(port)) throw new Error(`Unsupported Layer 2 browser port: ${port}`);
  const root = process.cwd();
  const outDir = path.join(root, `dist/docs/next/${componentId}-fixtures`);
  await mkdir(outDir, { recursive: true });
  const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
  let componentCss = await readFile(path.join(root, `packages/web/dist/components/${componentId}/${componentId}.css`), 'utf8');
  componentCss = componentCss.replace('@import "../../styles/tokens.css";\n', '').replace('@import "../button/button.css";\n', '');
  let dependencyCss = '';
  if (componentId === 'toggle-button') dependencyCss = (await readFile(path.join(root, 'packages/web/dist/components/button/button.css'), 'utf8')).replace('@import "../../styles/tokens.css";\n', '');
  await writeFile(path.join(outDir, `${componentId}.css`), `${tokensCss}\n${dependencyCss}\n${componentCss}`);

  if (port === 'web') {
    let script = '';
    if (componentId === 'toggle-button') {
      await writeClient(outDir, 'web.ts', `import{connectToggleButton}from'@vyrnforge/web/toggle-button';connectToggleButton(document.querySelector('#control'));`, root);
      script = '<script type="module" src="./web.js"></script>';
    } else if (componentId === 'checkbox') {
      script = '<script>document.querySelector("#control").indeterminate=true;</script>';
    }
    await writeFile(path.join(outDir, 'web.html'), page(componentId, `<form id="form">${definition.markup}</form>`, script));
    return;
  }

  if (port === 'react') {
    const { createElement } = await import('react');
    const { renderToString } = await import('react-dom/server');
    const module = await import(`@vyrnforge/react/${componentId}`);
    const Component = module[definition.exportName];
    let control;
    if (definition.select) control = createElement(Component, { id: 'control', ...definition.props }, createElement('option', { value: 'one' }, 'One'), createElement('option', { value: 'two' }, 'Two'));
    else control = createElement(Component, { id: 'control', ...definition.props }, definition.label === false ? (componentId === 'link' ? 'Example link' : 'Toggle') : undefined);
    const label = definition.label === false ? null : createElement('label', { htmlFor: 'control' }, componentId);
    const markup = renderToString(createElement('form', { id: 'form' }, label, control));
    let script = '';
    if (definition.hydrate) {
      const controlSource = reactControlSource(componentId, definition);
      await writeClient(outDir, 'react.ts', `import{createElement}from'react';import{hydrateRoot}from'react-dom/client';import{${definition.exportName}}from'@vyrnforge/react/${componentId}';const app=createElement('form',{id:'form'},${componentId === 'checkbox' ? "createElement('label',{htmlFor:'control'},'checkbox')," : ''}${controlSource});hydrateRoot(document.querySelector('#react-root'),app);`, root);
      script = '<script type="module" src="./react.js"></script>';
    }
    await writeFile(path.join(outDir, 'react.html'), page(componentId, `<div id="react-root">${markup}</div>`, script));
    return;
  }

  if (port === 'vue') {
    const { createSSRApp, h } = await import('vue');
    const { renderToString } = await import('@vue/server-renderer');
    const module = await import(`@vyrnforge/vue/${componentId}`);
    const Component = module[definition.exportName];
    const app = createSSRApp({ render: () => h('form', { id: 'form' }, [
      ...(definition.label === false ? [] : [h('label', { for: 'control' }, componentId)]),
      definition.select ? h(Component, { id: 'control', ...definition.props }, () => [h('option', { value: 'one' }, 'One'), h('option', { value: 'two' }, 'Two')]) : h(Component, { id: 'control', ...definition.props }, definition.label === false ? () => (componentId === 'link' ? 'Example link' : 'Toggle') : undefined),
    ]) });
    const markup = await renderToString(app);
    let script = '';
    if (definition.hydrate) {
      const controlSource = vueControlSource(componentId, definition);
      await writeClient(outDir, 'vue.ts', `import{createSSRApp,h}from'vue';import{${definition.exportName}}from'@vyrnforge/vue/${componentId}';const app=createSSRApp({render:()=>h('form',{id:'form'},[${componentId === 'checkbox' ? "h('label',{for:'control'},'checkbox')," : ''}${controlSource}])});app.mount('#vue-root');`, root);
      script = '<script type="module" src="./vue.js"></script>';
    }
    await writeFile(path.join(outDir, 'vue.html'), page(componentId, `<div id="vue-root">${markup}</div>`, script));
    return;
  }

  await import('@angular/compiler');
  const { Component, provideZonelessChangeDetection } = await import('@angular/core');
  const { bootstrapApplication } = await import('@angular/platform-browser');
  const { renderApplication } = await import('@angular/platform-server');
  const module = await import(`@vyrnforge/angular/${componentId}`);
  const DirectiveClass = module[definition.angularName];
  class App {}
  const template = `<form id="form">${definition.angular}</form>`;
  Component({ selector: 'vf-l2-browser-test', standalone: true, imports: [DirectiveClass], template })(App);
  const document = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./${componentId}.css"><title>${componentId} fixture</title></head><body><main><h1>${componentId} fixture</h1><vf-l2-browser-test></vf-l2-browser-test></main></body></html>`;
  const html = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document });
  let output = html;
  if (definition.hydrate) {
    await writeClient(outDir, 'angular.ts', `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{${definition.angularName}}from'@vyrnforge/angular/${componentId}';class App{};Component({selector:'vf-l2-browser-test',standalone:true,imports:[${definition.angularName}],template:${JSON.stringify(template)}})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});`, root);
    output = output.replace('</body>', '<script type="module" src="./angular.js"></script></body>');
  }
  await writeFile(path.join(outDir, 'angular.html'), output);
}
