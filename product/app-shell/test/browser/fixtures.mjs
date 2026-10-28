import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2];
const root = process.cwd();
const dir = path.join(root, 'dist/docs/next/app-shell-fixtures');
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
  const settingsEntry = path.join(root, 'product/app-shell/examples/settings-navigation/react.tsx');
  await build({
    entryPoints: [settingsEntry],
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

  const permissionEntry = path.join(root, 'product/app-shell/examples/permission-access/react.tsx');
  await build({
    entryPoints: [permissionEntry],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outdir: dir,
    entryNames: 'permission-access-react',
  });
  await writeFile(
    path.join(dir, 'permission-access-react.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Permission access fixture</title><link rel="stylesheet" href="./permission-access-react.css"><style>html,body{margin:0;min-block-size:100%;}</style></head><body><div id="root"></div><script type="module" src="./permission-access-react.js"></script></body></html>',
  );

  const crudEntry = path.join(root, 'product/app-shell/examples/item-management/react.tsx');
  await build({
    entryPoints: [crudEntry],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outdir: dir,
    entryNames: 'item-management-react',
  });
  await writeFile(
    path.join(dir, 'item-management-react.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Item management fixture</title><link rel="stylesheet" href="./item-management-react.css"><style>html,body{margin:0;min-block-size:100%;}</style></head><body><div id="root"></div><script type="module" src="./item-management-react.js"></script></body></html>',
  );

  const privacyEntry = path.join(root, 'product/app-shell/examples/privacy-controls/react.tsx');
  await build({
    entryPoints: [privacyEntry],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outdir: dir,
    entryNames: 'privacy-controls-react',
  });
  await writeFile(
    path.join(dir, 'privacy-controls-react.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Privacy controls fixture</title><link rel="stylesheet" href="./privacy-controls-react.css"><style>html,body{margin:0;min-block-size:100%;}</style></head><body><div id="root"></div><script type="module" src="./privacy-controls-react.js"></script></body></html>',
  );

  const visualizationEntry = path.join(root, 'product/app-shell/examples/data-visualization/react.tsx');
  await build({
    entryPoints: [visualizationEntry],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outdir: dir,
    entryNames: 'data-visualization-react',
  });
  await writeFile(
    path.join(dir, 'data-visualization-react.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Data visualization fixture</title><link rel="stylesheet" href="./data-visualization-react.css"><style>html,body{margin:0;min-block-size:100%;}</style></head><body><div id="root"></div><script type="module" src="./data-visualization-react.js"></script></body></html>',
  );

  const aiReplyEntry = path.join(root, 'product/app-shell/examples/ai-assisted-reply/react.tsx');
  await build({
    entryPoints: [aiReplyEntry],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outdir: dir,
    entryNames: 'ai-assisted-reply-react',
  });
  await writeFile(
    path.join(dir, 'ai-assisted-reply-react.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>AI-assisted reply fixture</title><link rel="stylesheet" href="./ai-assisted-reply-react.css"><style>html,body{margin:0;min-block-size:100%;}</style></head><body><div id="root"></div><script type="module" src="./ai-assisted-reply-react.js"></script></body></html>',
  );
}
