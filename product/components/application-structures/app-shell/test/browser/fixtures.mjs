import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const examplesRoot = fileURLToPath(new URL('../../examples/', import.meta.url));
import { build } from 'esbuild';

export const browserFixture = {
  component: 'app-shell',
  prepare: async ({ port }) => {
    const root = process.cwd();
    const dir = path.join(root, 'dist/browser-fixtures/components/app-shell');
    await mkdir(dir, { recursive: true });

    await build({
      stdin: {
        contents: '@import "@vyrnforge/web/styles/app-shell.css";',
        resolveDir: root,
        loader: 'css',
        sourcefile: 'app-shell-fixture.css',
      },
      bundle: true,
      outfile: path.join(dir, 'app-shell-fixture.css'),
    });

    await writeFile(
      path.join(dir, `${port}.html`),
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>App shell browser fixture</title><link rel="stylesheet" href="./app-shell-fixture.css"><style>html,body{margin:0;min-block-size:100%;}</style></head><body><div data-vf-app-shell><header data-vf-app-shell-header>Header</header><div data-vf-app-shell-body><aside data-vf-app-shell-navigation><nav aria-label="Primary"><a href="#main">Home</a></nav></aside><main id="main" data-vf-app-shell-main tabindex="-1"><h1>Home</h1></main></div><footer data-vf-app-shell-footer>Footer</footer></div></body></html>`,
    );

    // Preserve the historical fixture and application examples. This separate page
    // exercises the real public AppShell adapter for the selected port.
    const mount = { web: 'mountWeb', react: 'mountReact', angular: 'mountAngular', vue: 'mountVue', elements: 'mountElements' }[port];
    await build({
      stdin: {
        contents: 'import { ' + mount + ' } from "./optional-navigation.mjs"; await ' + mount + '();',
        resolveDir: fileURLToPath(new URL('.', import.meta.url)),
        sourcefile: 'optional-navigation-client.mjs',
      },
      bundle: true,
      format: 'esm',
      platform: 'browser',
      outfile: path.join(dir, 'optional-navigation.js'),
    });
    const rootTag = port === 'angular' ? 'vf-optional-shell-test' : 'div';
    await writeFile(
      path.join(dir, 'optional-navigation.html'),
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Optional AppShell navigation</title><link rel="stylesheet" href="./app-shell-fixture.css"><style>html,body{margin:0;min-block-size:100%}#root{display:block;max-inline-size:100%;margin-inline:auto}</style></head><body><' + rootTag + ' id="root"></' + rootTag + '><script type="module" src="./optional-navigation.js"></script></body></html>',
    );

    if (port === 'react') {
      const examples = [
        ['settings-navigation', 'Settings navigation fixture'],
        ['permission-access', 'Permission access fixture'],
        ['item-management', 'Item management fixture'],
        ['privacy-controls', 'Privacy controls fixture'],
        ['data-visualization', 'Data visualization fixture'],
        ['ai-assisted-reply', 'AI-assisted reply fixture'],
        ['data-table-management', 'Native table management fixture'],
        ['foundation-density', 'Foundation density fixture'],
        ['token-scope-overrides', 'Token scope overrides fixture'],
        ['recovery-workflows', 'Recovery workflows fixture'],
        ['notification-feedback', 'Notification feedback fixture'],
      ];

      for (const [name, title] of examples) {
        const entry = path.join(examplesRoot, name, 'react.tsx');
        await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'browser', outdir: dir, entryNames: `${name}-react` });
        await writeFile(
          path.join(dir, `${name}-react.html`),
          `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><link rel="stylesheet" href="./${name}-react.css"><style>html,body{margin:0;min-block-size:100%;}</style></head><body><div id="root"></div><script type="module" src="./${name}-react.js"></script></body></html>`,
        );
      }

      const performanceEntry = path.join(examplesRoot, 'performance-feedback', 'react.tsx');
      await build({
        entryPoints: [performanceEntry],
        bundle: true,
        splitting: true,
        format: 'esm',
        platform: 'browser',
        outdir: dir,
        entryNames: 'performance-feedback-react',
        chunkNames: 'performance-chunks/[name]-[hash]',
      });
      await writeFile(
        path.join(dir, 'performance-feedback-react.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Performance UX fixture</title><link rel="stylesheet" href="./performance-feedback-react.css"><style>html,body{margin:0;min-block-size:100%;}</style></head><body><div id="root"></div><script type="module" src="./performance-feedback-react.js"></script></body></html>',
      );
    }
  },
};
