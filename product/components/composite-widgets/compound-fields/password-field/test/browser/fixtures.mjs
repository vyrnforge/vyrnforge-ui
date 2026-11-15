import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'password-field',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/password-field');
    await mkdir(dir, { recursive: true });

    const showLabel = 'Visibilité du mot de passe : afficher';
    const hideLabel = 'Visibilité du mot de passe : masquer';

    const sources = {
      web: ``,
      react: `
        import { createElement } from 'react';
        import { createRoot } from 'react-dom/client';
        import { PasswordFieldInput, PasswordFieldRoot, PasswordFieldToggle } from '@vyrnforge/react/password-field';
        import '@vyrnforge/web/styles/tokens.css';
        import '@vyrnforge/web/styles/password-field.css';
        const mount = document.querySelector('#root');
        const field = (id, options, label, showLabel, hideLabel, name) => createElement(PasswordFieldRoot, { ...options, id: id + '-root' },
          createElement(PasswordFieldInput, { id, name, 'aria-label': label, defaultValue: 's3cret', autoComplete: 'current-password' }),
          createElement(PasswordFieldToggle, { id: id + '-toggle', showLabel, hideLabel })
        );
        createRoot(mount).render(createElement('div', null,
          field('password', {}, 'Mot de passe', '${showLabel}', '${hideLabel}', 'password'),
          field('controlled-password', { visible: false, onVisibleChange: (v) => { document.body.dataset.requested = String(v); } }, 'Controlled password', 'Show controlled password', 'Hide controlled password'),
          field('default-password', { defaultVisible: true }, 'Default password', 'Show default password', 'Hide default password'),
          field('disabled-password', { disabled: true }, 'Disabled password', 'Show disabled password', 'Hide disabled password')
        ));
      `,
      vue: `
        import { createApp, h } from 'vue';
        import { PasswordFieldInput, PasswordFieldRoot, PasswordFieldToggle } from '@vyrnforge/vue/password-field';
        const field = (id, options, label, showLabel, hideLabel, name) => h(PasswordFieldRoot, { ...options, id: id + '-root' }, {
          default: () => [
            h(PasswordFieldInput, { id, name, 'aria-label': label, value: 's3cret', autocomplete: 'current-password' }),
            h(PasswordFieldToggle, { id: id + '-toggle', showLabel, hideLabel })
          ]
        });
        createApp({
          render() {
            return h('div', null, [
              field('password', {}, 'Mot de passe', '${showLabel}', '${hideLabel}', 'password'),
              field('controlled-password', { visible: false, 'onUpdate:visible': (v) => { document.body.dataset.requested = String(v); } }, 'Controlled password', 'Show controlled password', 'Hide controlled password'),
              field('default-password', { defaultVisible: true }, 'Default password', 'Show default password', 'Hide default password'),
              field('disabled-password', { disabled: true }, 'Disabled password', 'Show disabled password', 'Hide disabled password')
            ]);
          }
        }).mount('#root');
      `,
      angular: `
        import '@angular/compiler';
        import { Component } from '@angular/core';
        import { bootstrapApplication } from '@angular/platform-browser';
        import { VfPasswordFieldInputDirective, VfPasswordFieldRootDirective, VfPasswordFieldToggleDirective } from '@vyrnforge/angular/password-field';

        @Component({
          selector: 'vf-password-fixture',
          standalone: true,
          imports: [VfPasswordFieldRootDirective, VfPasswordFieldInputDirective, VfPasswordFieldToggleDirective],
          template: \`<div vfPasswordFieldRoot>
            <input id="password" name="password" vfPasswordFieldInput aria-label="Mot de passe" value="s3cret" autocomplete="current-password">
            <button id="toggle" vfPasswordFieldToggle showLabel="${showLabel}" hideLabel="${hideLabel}">Visibilité du mot de passe</button>
          </div>
          <div vfPasswordFieldRoot [visible]="false" (visibleChange)="request($event)">
            <input vfPasswordFieldInput aria-label="Controlled password" value="s3cret" autocomplete="current-password">
            <button vfPasswordFieldToggle showLabel="Show controlled password" hideLabel="Hide controlled password">Controlled password visibility</button>
          </div>
          <div vfPasswordFieldRoot [defaultVisible]="true">
            <input vfPasswordFieldInput aria-label="Default password" value="s3cret" autocomplete="current-password">
            <button vfPasswordFieldToggle showLabel="Show default password" hideLabel="Hide default password">Default password visibility</button>
          </div>
          <div vfPasswordFieldRoot [disabled]="true">
            <input vfPasswordFieldInput aria-label="Disabled password" value="s3cret" autocomplete="current-password">
            <button vfPasswordFieldToggle showLabel="Show disabled password" hideLabel="Hide disabled password">Disabled password visibility</button>
          </div>\`
        })
        class PasswordFixture {
          request(value) { document.body.dataset.requested = String(value); }
        }

        bootstrapApplication(PasswordFixture);
      `,
      elements: `
        import { definePasswordFieldElement } from '@vyrnforge/elements/password-field';
        const mount = document.querySelector('#root');
        mount.innerHTML = \`<vf-password-field show-label="${showLabel}" hide-label="${hideLabel}">
          <input id="password" name="password" data-vf-password-field-input type="password" aria-label="Mot de passe" value="s3cret" autocomplete="current-password">
          <button id="toggle" data-vf-password-field-toggle type="button">Visibilité du mot de passe</button>
        </vf-password-field>\`;
        definePasswordFieldElement();
      `,
    };

    const source = sources[port];
    if (source === undefined) throw new Error(`Unsupported password-field browser port: ${port}`);

    await build({
      stdin: {
        contents: source,
        resolveDir: root,
        sourcefile: `password-field-${port}.ts`,
        loader: 'ts',
      },
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: path.join(dir, `${port}.js`),
      tsconfigRaw: { compilerOptions: { experimentalDecorators: true } },
    });

    const mount = port === 'angular' ? '<vf-password-fixture></vf-password-fixture>' : '<div id="root"></div>';
    const stylesheet = port === 'react' ? '<link rel="stylesheet" href="./react.css">' : '';
    await writeFile(
      path.join(dir, `${port}.html`),
      `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Password field browser fixture</title>${stylesheet}</head><body><main><h1>Password field browser fixture</h1><form id="credential-form">${mount}</form></main><script type="module" src="./${port}.js"></script></body></html>`,
    );

    if (port === 'react') {
      const entry = path.join(
        root,
        'product/components/composite-widgets/compound-fields/password-field/examples/session-recovery/react.tsx',
      );
      await build({
        entryPoints: [entry],
        bundle: true,
        format: 'esm',
        platform: 'browser',
        outdir: dir,
        entryNames: 'session-recovery-react',
      });
      await writeFile(
        path.join(dir, 'session-recovery-react.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Identity session recovery fixture</title><link rel="stylesheet" href="./session-recovery-react.css"><style>html,body{margin:0;min-block-size:100%;padding:1rem}</style></head><body><main><h1>Identity session recovery fixture</h1><div id="root"></div></main><script type="module" src="./session-recovery-react.js"></script></body></html>',
      );
    }
  },
};
