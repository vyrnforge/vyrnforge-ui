import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { publicPackageAliases } from '../example-compiler.mjs';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

const renderers = Object.freeze({
  react: {
    entry: path.join(packageRoot, 'renderers/react.tsx'),
    compilerOptions: { jsx: 'react' },
  },
  angular: {
    entry: path.join(packageRoot, 'renderers/angular.ts'),
    compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false },
  },
  vue: {
    entry: path.join(packageRoot, 'renderers/vue.js'),
    compilerOptions: {},
  },
});

export async function buildFrameworkDocsApps({ root, channelRoot }) {
  const outputRoot = path.join(channelRoot, 'assets/framework-apps');
  const aliases = publicPackageAliases(root);
  await mkdir(outputRoot, { recursive: true });

  for (const [framework, renderer] of Object.entries(renderers)) {
    await build({
      entryPoints: [renderer.entry],
      alias: aliases,
      bundle: true,
      format: 'iife',
      platform: 'browser',
      target: ['es2022'],
      legalComments: 'none',
      tsconfigRaw: { compilerOptions: renderer.compilerOptions },
      outfile: path.join(outputRoot, `${framework}.js`),
    });
  }
}
