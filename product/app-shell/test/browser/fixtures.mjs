import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2];
const root = process.cwd();
const dir = path.join(root, 'dist/docs/next/app-shell-fixtures');
await mkdir(dir, { recursive: true });

await writeFile(
  path.join(dir, `${port}.html`),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>App shell browser fixture</title><link rel="stylesheet" href="../assets/vyrnforge/styles.css"><style>html,body{margin:0;min-block-size:100%;}</style></head><body><div data-vf-app-shell><header data-vf-app-shell-header>Header</header><div data-vf-app-shell-body><aside data-vf-app-shell-navigation><nav aria-label="Primary"><a href="#main">Home</a></nav></aside><main id="main" data-vf-app-shell-main tabindex="-1"><h1>Home</h1></main></div><footer data-vf-app-shell-footer>Footer</footer></div></body></html>`,
);

if (port === 'react') {
  const entry = path.join(root, 'product/app-shell/examples/settings-navigation/react.tsx');
  await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outdir: dir,
    entryNames: 'settings-navigation-react',
  });
  await writeFile(
    path.join(dir, 'settings-navigation-react.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Settings navigation fixture</title><link rel="stylesheet" href="./settings-navigation-react.css"><style>html,body{margin:0;min-block-size:100%;}</style></head><body><div id="root"></div><script type="module" src="./settings-navigation-react.js"></script></body></html>',
  );
}
