import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'input',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/input');
    await mkdir(outDir, { recursive: true });

    const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const inputCss = (await readFile(path.join(root, 'packages/web/dist/components/input/input.css'), 'utf8')).replace('@import "../../styles/tokens.css";\n', '');
    await writeFile(path.join(outDir, 'input.css'), `${tokensCss}\n${inputCss}`);

    const fields = `
  <form id="form">
    <label for="editable">Editable</label><input id="editable" data-vf-input name="editable" value="alpha" required>
    <label for="readonly">Readonly</label><input id="readonly" data-vf-input name="readonly" value="kept" readonly>
    <label for="disabled">Disabled</label><input id="disabled" data-vf-input name="disabled" value="omitted" disabled>
    <label for="required">Required</label><input id="required" data-vf-input name="required" required placeholder="Required value">
    <label for="app-invalid">Application invalid</label><input id="app-invalid" data-vf-input name="app-invalid" aria-invalid="true" value="bad">
  </form>`;
    const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./input.css"><title>Input fixture</title><style>body{background:var(--vf-color-surface);color:var(--vf-color-text);}</style></head><body><main><h1>Input fixture</h1>${body}</main></body></html>`;

    if (port === 'web' || port === 'elements') {
      await writeFile(path.join(outDir, `${port}.html`), page(fields));
    }

    if (port === 'react') {
      const { createElement } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { Input } = await import('@vyrnforge/react/input');
      const input = (id, props = {}) => createElement(Input, { id, name: id, ...props });
      const markup = renderToString(createElement('form', { id: 'form' },
        createElement('label', { htmlFor: 'editable' }, 'Editable'), input('editable', { defaultValue: 'alpha', required: true }),
        createElement('label', { htmlFor: 'readonly' }, 'Readonly'), input('readonly', { defaultValue: 'kept', readOnly: true }),
        createElement('label', { htmlFor: 'disabled' }, 'Disabled'), input('disabled', { defaultValue: 'omitted', disabled: true }),
        createElement('label', { htmlFor: 'required' }, 'Required'), input('required', { required: true, placeholder: 'Required value' }),
        createElement('label', { htmlFor: 'app-invalid' }, 'Application invalid'), input('app-invalid', { 'aria-invalid': true, defaultValue: 'bad' })
      ));
      await writeFile(path.join(outDir, 'react.html'), page(markup));

      const profileBuild = await build({
        stdin: {
          resolveDir: root,
          sourcefile: 'react-profile-client.tsx',
          contents: `import{createElement}from'react';import{createRoot}from'react-dom/client';import{Example}from'./product/input/examples/profile-edit/react.tsx';const root=document.querySelector('#profile-app');if(!root)throw new Error('Missing #profile-app');createRoot(root).render(createElement(Example));`,
        },
        bundle: true,
        format: 'iife',
        platform: 'browser',
        jsx: 'automatic',
        outdir: outDir,
        write: false,
      });
      const profileJs = profileBuild.outputFiles.find((file) => file.path.endsWith('.js'))?.text;
      const profileCss = profileBuild.outputFiles.find((file) => file.path.endsWith('.css'))?.text ?? '';
      if (!profileJs) throw new Error('Profile fixture client bundle was not generated');
      const safeProfileJs = profileJs.replaceAll('</script', '<\\/script');
      await writeFile(path.join(outDir, 'react-profile.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Profile form fixture</title><style>${profileCss}</style></head><body><main><h1>STD-06 profile form fixture</h1><div id="profile-app"></div></main><script>${safeProfileJs}</script></body></html>`);
    }

    if (port === 'vue') {
      const { createSSRApp, h } = await import('vue');
      const { renderToString } = await import('@vue/server-renderer');
      const { Input } = await import('@vyrnforge/vue/input');
      const input = (id, props = {}) => h(Input, { id, name: id, ...props });
      const markup = await renderToString(createSSRApp({ render: () => h('form', { id: 'form' }, [
        h('label', { for: 'editable' }, 'Editable'), input('editable', { value: 'alpha', required: true }),
        h('label', { for: 'readonly' }, 'Readonly'), input('readonly', { value: 'kept', readonly: true }),
        h('label', { for: 'disabled' }, 'Disabled'), input('disabled', { value: 'omitted', disabled: true }),
        h('label', { for: 'required' }, 'Required'), input('required', { required: true, placeholder: 'Required value' }),
        h('label', { for: 'app-invalid' }, 'Application invalid'), input('app-invalid', { 'aria-invalid': 'true', value: 'bad' })
      ]) }));
      await writeFile(path.join(outDir, 'vue.html'), page(markup));
    }

    if (port === 'angular') {
      await import('@angular/compiler');
      const { Component, provideZonelessChangeDetection } = await import('@angular/core');
      const { bootstrapApplication } = await import('@angular/platform-browser');
      const { renderApplication } = await import('@angular/platform-server');
      const { VfInputDirective } = await import('@vyrnforge/angular/input');
      class App {}
      Component({ selector: 'vf-input-test', standalone: true, imports: [VfInputDirective], template: `<main><h1>Input fixture</h1><form id="form"><label for="editable">Editable</label><input id="editable" vfInput name="editable" value="alpha" required><label for="readonly">Readonly</label><input id="readonly" vfInput name="readonly" value="kept" readonly><label for="disabled">Disabled</label><input id="disabled" vfInput name="disabled" value="omitted" disabled><label for="required">Required</label><input id="required" vfInput name="required" required placeholder="Required value"><label for="app-invalid">Application invalid</label><input id="app-invalid" vfInput name="app-invalid" aria-invalid="true" value="bad"></form></main>` })(App);
      const html = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html lang="en"><head><title>Input fixture</title><link rel="stylesheet" href="./input.css"><style>body{background:var(--vf-color-surface);color:var(--vf-color-text);}</style></head><body><vf-input-test></vf-input-test></body></html>' });
      await writeFile(path.join(outDir, 'angular.html'), html);
    }
  },
};
