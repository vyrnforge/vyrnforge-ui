import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2];
const root = process.cwd();
const dir = path.join(root, 'dist/browser-fixtures/components/alert-dialog');
await mkdir(dir, { recursive: true });

if (port === 'react') {
  const entry = path.join(root, 'product/alert-dialog/examples/destructive-commit/react.tsx');
  await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outdir: dir,
    entryNames: 'react',
  });
  await writeFile(
    path.join(dir, 'react.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Alert dialog destructive workflow fixture</title><link rel="stylesheet" href="./react.css"></head><body><div id="root"></div><script type="module" src="./react.js"></script></body></html>',
  );
} else {
  await writeFile(
    path.join(dir, `${port}.html`),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Alert dialog browser fixture</title></head><body><dialog open role="alertdialog" aria-labelledby="t"><h2 id="t">Delete item?</h2><button>Cancel</button><button>Delete</button></dialog></body></html>',
  );
}
