import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const browserFixture = {
  component: 'textarea',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const outDir = path.join(root, 'dist/browser-fixtures/components/textarea');
    await mkdir(outDir, { recursive: true });

    const tokensCss = await readFile(path.join(root, 'packages/web/dist/styles/tokens.css'), 'utf8');
    const textareaCss = (await readFile(path.join(root, 'packages/web/dist/components/textarea/textarea.css'), 'utf8')).replace('@import "../../styles/tokens.css";\n', '');
    await writeFile(path.join(outDir, 'textarea.css'), `${tokensCss}\n${textareaCss}`);

    const fields = `
  <form id="form">
    <label for="editable">Editable</label><textarea id="editable" data-vf-textarea name="editable" rows="4" cols="30" wrap="soft" required>alpha\nbeta</textarea>
    <label for="readonly">Readonly</label><textarea id="readonly" data-vf-textarea name="readonly" readonly>kept</textarea>
    <label for="disabled">Disabled</label><textarea id="disabled" data-vf-textarea name="disabled" disabled>omitted</textarea>
    <label for="required">Required</label><textarea id="required" data-vf-textarea name="required" required placeholder="Required value"></textarea>
    <label for="constrained">Constrained</label><textarea id="constrained" data-vf-textarea name="constrained" minlength="3" maxlength="8"></textarea>
    <label for="app-invalid">Application invalid</label><textarea id="app-invalid" data-vf-textarea name="app-invalid" aria-invalid="true">bad</textarea>
  </form>`;
    const page = (body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="./textarea.css"><title>Textarea fixture</title></head><body><main><h1>Textarea fixture</h1>${body}</main></body></html>`;

    if (port === 'web' || port === 'elements') {
      await writeFile(path.join(outDir, `${port}.html`), page(fields));
    }

    if (port === 'react') {
      const { createElement } = await import('react');
      const { renderToString } = await import('react-dom/server');
      const { Textarea } = await import('@vyrnforge/react/textarea');
      const textarea = (id, props = {}) => createElement(Textarea, { id, name: id, ...props });
      const markup = renderToString(createElement('form', { id: 'form' },
        createElement('label', { htmlFor: 'editable' }, 'Editable'), textarea('editable', { defaultValue: 'alpha\nbeta', rows: 4, cols: 30, wrap: 'soft', required: true }),
        createElement('label', { htmlFor: 'readonly' }, 'Readonly'), textarea('readonly', { defaultValue: 'kept', readOnly: true }),
        createElement('label', { htmlFor: 'disabled' }, 'Disabled'), textarea('disabled', { defaultValue: 'omitted', disabled: true }),
        createElement('label', { htmlFor: 'required' }, 'Required'), textarea('required', { required: true, placeholder: 'Required value' }),
        createElement('label', { htmlFor: 'constrained' }, 'Constrained'), textarea('constrained', { minLength: 3, maxLength: 8 }),
        createElement('label', { htmlFor: 'app-invalid' }, 'Application invalid'), textarea('app-invalid', { 'aria-invalid': true, defaultValue: 'bad' })
      ));
      await writeFile(path.join(outDir, 'react.html'), page(markup));
    }

    if (port === 'vue') {
      const { createSSRApp, h } = await import('vue');
      const { renderToString } = await import('@vue/server-renderer');
      const { Textarea } = await import('@vyrnforge/vue/textarea');
      const textarea = (id, props = {}) => h(Textarea, { id, name: id, ...props });
      const markup = await renderToString(createSSRApp({ render: () => h('form', { id: 'form' }, [
        h('label', { for: 'editable' }, 'Editable'), textarea('editable', { value: 'alpha\nbeta', rows: 4, cols: 30, wrap: 'soft', required: true }),
        h('label', { for: 'readonly' }, 'Readonly'), textarea('readonly', { value: 'kept', readonly: true }),
        h('label', { for: 'disabled' }, 'Disabled'), textarea('disabled', { value: 'omitted', disabled: true }),
        h('label', { for: 'required' }, 'Required'), textarea('required', { required: true, placeholder: 'Required value' }),
        h('label', { for: 'constrained' }, 'Constrained'), textarea('constrained', { minlength: 3, maxlength: 8 }),
        h('label', { for: 'app-invalid' }, 'Application invalid'), textarea('app-invalid', { 'aria-invalid': 'true', value: 'bad' })
      ]) }));
      await writeFile(path.join(outDir, 'vue.html'), page(markup));
    }

    if (port === 'angular') {
      await import('@angular/compiler');
      const { Component, provideZonelessChangeDetection } = await import('@angular/core');
      const { bootstrapApplication } = await import('@angular/platform-browser');
      const { renderApplication } = await import('@angular/platform-server');
      const { VfTextareaDirective } = await import('@vyrnforge/angular/textarea');
      class App {}
      Component({ selector: 'vf-textarea-test', standalone: true, imports: [VfTextareaDirective], template: `<main><h1>Textarea fixture</h1><form id="form"><label for="editable">Editable</label><textarea id="editable" vfTextarea name="editable" rows="4" cols="30" wrap="soft" required>alpha\nbeta</textarea><label for="readonly">Readonly</label><textarea id="readonly" vfTextarea name="readonly" readonly>kept</textarea><label for="disabled">Disabled</label><textarea id="disabled" vfTextarea name="disabled" disabled>omitted</textarea><label for="required">Required</label><textarea id="required" vfTextarea name="required" required placeholder="Required value"></textarea><label for="constrained">Constrained</label><textarea id="constrained" vfTextarea name="constrained" minlength="3" maxlength="8"></textarea><label for="app-invalid">Application invalid</label><textarea id="app-invalid" vfTextarea name="app-invalid" aria-invalid="true">bad</textarea></form></main>` })(App);
      const html = await renderApplication((context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context), { document: '<!doctype html><html lang="en"><head><title>Textarea fixture</title><link rel="stylesheet" href="./textarea.css"></head><body><vf-textarea-test></vf-textarea-test></body></html>' });
      await writeFile(path.join(outDir, 'angular.html'), html);
    }
  },
};
