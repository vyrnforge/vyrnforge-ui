import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { loadNativeControlContract } from './native-control-contract.mjs';

function page(componentId, body, script = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./${componentId}.css"><title>${componentId} fixture</title></head><body><main><h1>${componentId} fixture</h1>${body}</main>${script}</body></html>`;
}

function vueInitialProps(props = {}) {
  const { defaultValue, defaultChecked, ...rest } = props;
  return { ...rest, ...(defaultValue !== undefined ? { value: defaultValue } : {}), ...(defaultChecked !== undefined ? { checked: defaultChecked } : {}) };
}

async function writeClient(outDir, fileName, source, root) {
  await build({ stdin: { resolveDir: root, sourcefile: fileName, contents: source }, bundle: true, format: 'esm', platform: 'browser', outfile: path.join(outDir, fileName.replace(/\.ts$/, '.js')) });
}

function reactClientControl(contract) {
  const props = JSON.stringify({ id: 'control', ...(contract.props ?? {}) });
  return `createElement(${contract.exportName},${props}${contract.content === undefined ? '' : `,${JSON.stringify(contract.content)}`})`;
}

function vueClientControl(contract) {
  const props = JSON.stringify({ id: 'control', ...vueInitialProps(contract.props) });
  return `h(${contract.exportName},${props}${contract.content === undefined ? '' : `,()=>${JSON.stringify(contract.content)}`})`;
}

export async function buildNativeControlBrowserFixture(componentId, port) {
  const contract = await loadNativeControlContract(componentId);
  if (!['web', 'react', 'angular', 'vue'].includes(port)) throw new Error(`Unsupported native-control browser port: ${port}`);
  const root = process.cwd();
  const outDir = path.join(root, `dist/docs/next/${componentId}-fixtures`);
  await mkdir(outDir, { recursive: true });
  const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
  let componentCss = await readFile(path.join(root, `packages/web/dist/components/${componentId}/${componentId}.css`), 'utf8');
  componentCss = componentCss.replace('@import "../../styles/tokens.css";\n', '');
  let dependencyCss = '';
  for (const dependency of contract.styleDependencies ?? []) {
    dependencyCss += `${(await readFile(path.join(root, `packages/web/dist/components/${dependency}/${dependency}.css`), 'utf8')).replace('@import "../../styles/tokens.css";\n', '')}\n`;
    componentCss = componentCss.replace(`@import "../${dependency}/${dependency}.css";\n`, '');
  }
  await writeFile(path.join(outDir, `${componentId}.css`), `${tokensCss}\n${dependencyCss}\n${componentCss}`);

  if (port === 'web') {
    let script = '';
    if (contract.webConnector) {
      await writeClient(outDir, 'web.ts', `import{${contract.webConnector}}from'@vyrnforge/web/${componentId}';${contract.webConnector}(document.querySelector('#control'));`, root);
      script = '<script type="module" src="./web.js"></script>';
    } else if (contract.webInlineScript) {
      script = `<script>${contract.webInlineScript}</script>`;
    }
    await writeFile(path.join(outDir, 'web.html'), page(componentId, `<form id="form">${contract.markup}</form>`, script));
    return;
  }

  if (port === 'react') {
    const { createElement } = await import('react');
    const { renderToString } = await import('react-dom/server');
    const module = await import(`@vyrnforge/react/${componentId}`);
    const Component = module[contract.exportName];
    const props = { id: 'control', ...(contract.props ?? {}) };
    const control = contract.select
      ? createElement(Component, props, createElement('option', { value: 'one' }, 'One'), createElement('option', { value: 'two' }, 'Two'))
      : createElement(Component, props, contract.content);
    const label = contract.label === false ? null : createElement('label', { htmlFor: 'control' }, componentId);
    const markup = renderToString(createElement('form', { id: 'form' }, label, control));
    let script = '';
    if (contract.hydrate) {
      const labelSource = contract.label === false ? '' : `createElement('label',{htmlFor:'control'},${JSON.stringify(componentId)}),`;
      await writeClient(outDir, 'react.ts', `import{createElement}from'react';import{hydrateRoot}from'react-dom/client';import{${contract.exportName}}from'@vyrnforge/react/${componentId}';const app=createElement('form',{id:'form'},${labelSource}${reactClientControl(contract)});hydrateRoot(document.querySelector('#react-root'),app);`, root);
      script = '<script type="module" src="./react.js"></script>';
    }
    await writeFile(path.join(outDir, 'react.html'), page(componentId, `<div id="react-root">${markup}</div>`, script));
    return;
  }

  if (port === 'vue') {
    const { createSSRApp, h } = await import('vue');
    const { renderToString } = await import('@vue/server-renderer');
    const module = await import(`@vyrnforge/vue/${componentId}`);
    const Component = module[contract.exportName];
    const props = vueInitialProps(contract.props);
    const app = createSSRApp({ render: () => h('form', { id: 'form' }, [
      ...(contract.label === false ? [] : [h('label', { for: 'control' }, componentId)]),
      contract.select
        ? h(Component, { id: 'control', ...props }, () => [h('option', { value: 'one', selected: props.value === 'one' }, 'One'), h('option', { value: 'two', selected: props.value === 'two' }, 'Two')])
        : h(Component, { id: 'control', ...props }, contract.content === undefined ? undefined : () => contract.content),
    ]) });
    const markup = await renderToString(app);
    let script = '';
    if (contract.hydrate) {
      const labelSource = contract.label === false ? '' : `h('label',{for:'control'},${JSON.stringify(componentId)}),`;
      await writeClient(outDir, 'vue.ts', `import{createSSRApp,h}from'vue';import{${contract.exportName}}from'@vyrnforge/vue/${componentId}';const app=createSSRApp({render:()=>h('form',{id:'form'},[${labelSource}${vueClientControl(contract)}])});app.mount('#vue-root');`, root);
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
  const DirectiveClass = module[contract.angularName];
  class App {}
  const template = `<form id="form">${contract.angular}</form>`;
  Component({ selector: 'vf-native-control-browser-test', standalone: true, imports: [DirectiveClass], template })(App);
  const document = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="./${componentId}.css"><title>${componentId} fixture</title></head><body><main><h1>${componentId} fixture</h1><vf-native-control-browser-test></vf-native-control-browser-test></main></body></html>`;
  const html = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document });
  let output = html;
  if (contract.hydrate) {
    await writeClient(outDir, 'angular.ts', `import'@angular/compiler';import{Component,provideZonelessChangeDetection}from'@angular/core';import{bootstrapApplication}from'@angular/platform-browser';import{${contract.angularName}}from'@vyrnforge/angular/${componentId}';class App{};Component({selector:'vf-native-control-browser-test',standalone:true,imports:[${contract.angularName}],template:${JSON.stringify(template)}})(App);bootstrapApplication(App,{providers:[provideZonelessChangeDetection()]});`, root);
    output = output.replace('</body>', '<script type="module" src="./angular.js"></script></body>');
  }
  await writeFile(path.join(outDir, 'angular.html'), output);
}
