import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

export const browserFixture = {
  component: 'otp-field',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/otp-field');
    await mkdir(dir, { recursive: true });

    const labels = [
      'Chiffre 1 sur 4 du code',
      'Chiffre 2 sur 4 du code',
      'Chiffre 3 sur 4 du code',
      'Chiffre 4 sur 4 du code',
    ];

    const sources = {
      web: ``,
      react: `
        import { createElement } from 'react';
        import { createRoot } from 'react-dom/client';
        import { OTPFieldInput, OTPFieldRoot } from '@vyrnforge/react/otp-field';
        import '@vyrnforge/web/styles/tokens.css';
        import '@vyrnforge/web/styles/otp-field.css';
        const labels = ${JSON.stringify(labels)};
        createRoot(document.querySelector('#root')).render(
          createElement(OTPFieldRoot, { length: 4, 'aria-label': 'Code de vérification' },
            ...labels.map((label, index) => createElement(OTPFieldInput, { key: index, index, 'aria-label': label }))
          )
        );
      `,
      vue: `
        import { createApp, h } from 'vue';
        import { OTPFieldInput, OTPFieldRoot } from '@vyrnforge/vue/otp-field';
        const labels = ${JSON.stringify(labels)};
        createApp({
          render() {
            return h(OTPFieldRoot, { length: 4, 'aria-label': 'Code de vérification' }, {
              default: () => labels.map((label, index) => h(OTPFieldInput, { index, 'aria-label': label }))
            });
          }
        }).mount('#root');
      `,
      angular: `
        import '@angular/compiler';
        import { Component } from '@angular/core';
        import { bootstrapApplication } from '@angular/platform-browser';
        import { VfOtpFieldInputDirective, VfOtpFieldRootDirective } from '@vyrnforge/angular/otp-field';

        @Component({
          selector: 'vf-otp-fixture',
          standalone: true,
          imports: [VfOtpFieldRootDirective, VfOtpFieldInputDirective],
          template: \`<div vfOtpFieldRoot aria-label="Code de vérification" [length]="4">
            <input [vfOtpFieldInput]="0" aria-label="Chiffre 1 sur 4 du code">
            <input [vfOtpFieldInput]="1" aria-label="Chiffre 2 sur 4 du code">
            <input [vfOtpFieldInput]="2" aria-label="Chiffre 3 sur 4 du code">
            <input [vfOtpFieldInput]="3" aria-label="Chiffre 4 sur 4 du code">
          </div>\`
        })
        class OTPFixture {}

        bootstrapApplication(OTPFixture);
      `,
      elements: `
        import { defineOtpFieldElement } from '@vyrnforge/elements/otp-field';
        const mount = document.querySelector('#root');
        mount.innerHTML = \`<vf-otp-field aria-label="Code de vérification">
          <input data-vf-otp-field-input aria-label="Chiffre 1 sur 4 du code">
          <input data-vf-otp-field-input aria-label="Chiffre 2 sur 4 du code">
          <input data-vf-otp-field-input aria-label="Chiffre 3 sur 4 du code">
          <input data-vf-otp-field-input aria-label="Chiffre 4 sur 4 du code">
        </vf-otp-field>\`;
        defineOtpFieldElement();
      `,
    };

    const source = sources[port];
    if (source === undefined) throw new Error(`Unsupported otp-field browser port: ${port}`);

    await build({
      stdin: {
        contents: source,
        resolveDir: root,
        sourcefile: `otp-field-${port}.ts`,
        loader: 'ts',
      },
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: path.join(dir, `${port}.js`),
      tsconfigRaw: { compilerOptions: { experimentalDecorators: true } },
    });

    const mount = port === 'angular' ? '<vf-otp-fixture></vf-otp-fixture>' : '<div id="root"></div>';
    const stylesheet = port === 'react' ? '<link rel="stylesheet" href="./react.css">' : '';
    await writeFile(
      path.join(dir, `${port}.html`),
      `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>OTP field browser fixture</title>${stylesheet}</head><body><main><h1>OTP field browser fixture</h1>${mount}</main><script type="module" src="./${port}.js"></script></body></html>`,
    );
  },
};
