import path from 'node:path';

export function validateAngularNativeControlContract(contract, componentId) {
  if (typeof contract.angularName !== 'string' || !contract.angularName.trim()) {
    throw new Error(`${componentId}/angular native-control fixture requires angularName`);
  }
  if (typeof contract.angular !== 'string' || !contract.angular.trim()) {
    throw new Error(`${componentId}/angular native-control fixture requires angular template`);
  }
  if (contract.hydrate !== undefined && typeof contract.hydrate !== 'boolean') {
    throw new Error(`${componentId}/angular native-control fixture hydrate must be a boolean when provided`);
  }
  return contract;
}

export async function buildNativeControlPortFixture({ componentId, contract, outDir, writeClient, writeFile, root }) {
  validateAngularNativeControlContract(contract, componentId);
  await import('@angular/compiler');
  const { Component, provideZonelessChangeDetection } = await import('@angular/core');
  const { bootstrapApplication } = await import('@angular/platform-browser');
  const { renderApplication } = await import('@angular/platform-server');
  const module = await import(`@vyrnforge/angular/${componentId}`);
  const DirectiveClass = module[contract.angularName];
  if (!DirectiveClass) throw new Error(`${componentId}/angular does not export ${contract.angularName}`);
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
