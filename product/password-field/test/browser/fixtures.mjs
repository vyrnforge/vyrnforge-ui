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
        createRoot(mount).render(createElement(PasswordFieldRoot, null,
          createElement(PasswordFieldInput, { id: 'password', 'aria-label': 'Mot de passe', defaultValue: 's3cret', autoComplete: 'current-password' }),
          createElement(PasswordFieldToggle, { id: 'toggle', showLabel: 'Visibilité du mot de passe : afficher', hideLabel: 'Visibilité du mot de passe : masquer' })
        ));
      `,
      vue: `
        import { createApp, h } from 'vue';
        import { PasswordFieldInput, PasswordFieldRoot, PasswordFieldToggle } from '@vyrnforge/vue/password-field';
        createApp({
          render() {
            return h(PasswordFieldRoot, null, {
              default: () => [
                h(PasswordFieldInput, { id: 'password', 'aria-label': 'Mot de passe', value: 's3cret', autocomplete: 'current-password' }),
                h(PasswordFieldToggle, { id: 'toggle', showLabel: 'Visibilité du mot de passe : afficher', hideLabel: 'Visibilité du mot de passe : masquer' })
              ]
            });
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
            <input id="password" vfPasswordFieldInput aria-label="Mot de passe" value="s3cret" autocomplete="current-password">
            <button id="toggle" vfPasswordFieldToggle showLabel="${showLabel}" hideLabel="${hideLabel}">Visibilité du mot de passe</button>
          </div>\`
        })
        class PasswordFixture {}

        bootstrapApplication(PasswordFixture);
      `,
      elements: `
        import { definePasswordFieldElement } from '@vyrnforge/elements/password-field';
        const mount = document.querySelector('#root');
        mount.innerHTML = \`<vf-password-field show-label="${showLabel}" hide-label="${hideLabel}">
          <input id="password" data-vf-password-field-input type="password" aria-label="Mot de passe" value="s3cret" autocomplete="current-password">
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
      `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Password field browser fixture</title>${stylesheet}</head><body><main><h1>Password field browser fixture</h1>${mount}</main><script type="module" src="./${port}.js"></script></body></html>`,
    );

    if (port === 'react') {
      const entry = path.join(root, 'product/password-field/examples/session-recovery/react.tsx');
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
