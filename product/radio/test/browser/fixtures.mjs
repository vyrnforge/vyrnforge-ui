import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { buildNativeControlBrowserFixture } from '../../../../tooling/testing/native-control-browser-fixture.mjs';

const port = process.argv[2] || 'web';
const root = process.cwd();
const outDir = path.join(root, 'dist/docs/next/radio-fixtures');
await buildNativeControlBrowserFixture('radio', port);

const exampleDir = path.join(root, 'product/radio/examples/platform-adaptation');

if (port === 'web') {
  const body = await readFile(path.join(exampleDir, 'native-web.html'), 'utf8');
  await writeFile(path.join(outDir, 'platform-web.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Platform adaptation fixture</title></head><body><main><h1>Delivery preference</h1>${body}</main></body></html>`);
} else if (['react', 'angular', 'vue'].includes(port)) {
  const sourceByPort = { react: 'react.tsx', angular: 'angular.ts', vue: 'vue.ts' };
  await build({
    entryPoints: [path.join(exampleDir, sourceByPort[port])],
    bundle: true,
    format: 'esm',
    platform: 'browser',
    outdir: outDir,
    entryNames: `platform-${port}`,
  });
  const mount = port === 'angular' ? '<vf-example-root></vf-example-root>' : '<div id="root"></div>';
  await writeFile(path.join(outDir, `platform-${port}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Platform adaptation fixture</title><link rel="stylesheet" href="./platform-${port}.css"></head><body><main><h1>Delivery preference</h1>${mount}</main><script type="module" src="./platform-${port}.js"></script></body></html>`);
}
