import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2];
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
  ];

  for (const [name, title] of examples) {
    const entry = path.join(root, `product/app-shell/examples/${name}/react.tsx`);
    await build({ entryPoints: [entry], bundle: true, format: 'esm', platform: 'browser', outdir: dir, entryNames: `${name}-react` });
    await writeFile(
      path.join(dir, `${name}-react.html`),
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><link rel="stylesheet" href="./${name}-react.css"><style>html,body{margin:0;min-block-size:100%;}</style></head><body><div id="root"></div><script type="module" src="./${name}-react.js"></script></body></html>`,
    );
  }

  const performanceEntry = path.join(root, 'product/app-shell/examples/performance-feedback/react.tsx');
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
