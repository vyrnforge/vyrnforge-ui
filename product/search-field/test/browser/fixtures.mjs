import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';

const port = process.argv[2];
const root = process.cwd();
const dir = path.join(root, 'dist/docs/next/search-field-fixtures');
await mkdir(dir, { recursive: true });

await writeFile(
  path.join(dir, `${port}.html`),
  `<!doctype html><html lang="en"><head><title>Search field browser fixture</title></head><body><main><h1>Search field browser fixture</h1><div role="search"><input id="search" type="search" aria-label="Search" value="forge"><button id="clear" type="button" aria-label="Clear search">×</button></div></main><script>clear.onclick=()=>{search.value='';search.focus();search.dispatchEvent(new Event('input',{bubbles:true}))};</script></body></html>`,
);

if (port === 'react') {
  const entry = path.join(root, 'product/search-field/examples/data-explorer/react.tsx');
  await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outdir: dir,
    entryNames: 'data-explorer-react',
  });
  await writeFile(
    path.join(dir, 'data-explorer-react.html'),
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Search data explorer fixture</title><link rel="stylesheet" href="./data-explorer-react.css"><style>html,body{margin:0;min-block-size:100%;padding:1rem}</style></head><body><div id="root"></div><script type="module" src="./data-explorer-react.js"></script></body></html>',
  );
}
