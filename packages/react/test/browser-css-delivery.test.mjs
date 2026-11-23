import { test } from 'vitest';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));

async function compileBrowser(source) {
  return build({
    stdin: { contents: source, resolveDir: root, sourcefile: 'react-css-consumer.js', loader: 'js' },
    platform: 'browser',
    format: 'esm',
    bundle: true,
    treeShaking: true,
    logLevel: 'silent',
    metafile: true,
    write: false,
    outdir: path.join(root, 'tmp/react-browser-css-evidence'),
    external: ['react', 'react-dom', 'react-dom/*'],
  });
}

function emittedCss(result) {
  return result.outputFiles.filter((file) => file.path.endsWith('.css'))
    .map((file) => file.text).join('\n');
}

function expectNoDocsCss(result) {
  const inputs = Object.keys(result.metafile.inputs);
  assert.ok(!inputs.some((file) => file.includes('/apps/docs/') || file.endsWith('/docs.css')));
  assert.equal(emittedCss(result).includes('.vf-docs-'), false);
}

test('React granular Code auto-loads canonical Code + Text styles, but no unrelated component CSS', async () => {
  const result = await compileBrowser("import { Code } from '@vyrnforge/react/code'; console.log(Code);");
  expectNoDocsCss(result);
  const css = emittedCss(result);
  assert.match(css, /data-vf-code/);
  assert.match(css, /data-vf-text-variant/);
  assert.doesNotMatch(css, /data-vf-button/);
  assert.doesNotMatch(css, /data-vf-kbd/);
  const inputs = Object.keys(result.metafile.inputs);
  assert.ok(inputs.some((file) => file.endsWith('/components/code/browser.js')));
  assert.ok(inputs.some((file) => file.endsWith('/components/code/code.css')));
  assert.ok(inputs.some((file) => file.endsWith('/components/text/text.css')));
  assert.ok(!inputs.some((file) => file.endsWith('/styles/reset.css')));
});

test('React granular Kbd auto-loads the canonical keycap style without unrelated Button', async () => {
  const result = await compileBrowser("import { Kbd } from '@vyrnforge/react/kbd'; console.log(Kbd);");
  expectNoDocsCss(result);
  const css = emittedCss(result);
  assert.match(css, /data-vf-kbd/);
  assert.match(css, /data-vf-text-variant/);
  assert.doesNotMatch(css, /data-vf-button/);
});

test('React root auto-loads canonical aggregate styles, preserving existing root import ergonomics', async () => {
  const result = await compileBrowser("import { Text, Code, Kbd } from '@vyrnforge/react'; console.log(Text, Code, Kbd);");
  expectNoDocsCss(result);
  const css = emittedCss(result);
  assert.match(css, /data-vf-text/);
  assert.match(css, /data-vf-code/);
  assert.match(css, /data-vf-kbd/);
  assert.match(css, /data-vf-button/);
  assert.ok(Object.keys(result.metafile.inputs).some((file) => file.endsWith('/react/dist/browser.js')));
  assert.ok(!Object.keys(result.metafile.inputs).some((file) => file.endsWith('/styles/reset.css')));
});

test('Node direct ESM resolves React public components to the CSS-free SSR export', () => {
  assert.match(import.meta.resolve('@vyrnforge/react/code'), /react\/dist\/components\/code\/index\.js$/);
  assert.match(import.meta.resolve('@vyrnforge/react'), /react\/dist\/index\.js$/);
});
