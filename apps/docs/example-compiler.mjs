import path from 'node:path';
import { build } from 'esbuild';
import { discoverProductUnits } from '../../tooling/testing/discover-product-units.mjs';

function exportTarget(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;
  return value.import || value.default || Object.values(value).find((entry) => typeof entry === 'string') || null;
}

export function publicPackageAliases(root, { source = false } = {}) {
  const aliases = {};
  for (const { name, manifest } of discoverProductUnits(root).packages) {
    for (const [exportName, value] of Object.entries(manifest.exports ?? {})) {
      if (exportName === '.') continue;
      const target = exportTarget(value);
      if (!target?.startsWith('./dist/')) continue;
      const resolvedTarget = source ? target.replace(/^\.\/dist\//, './src/') : target;
      aliases[`${manifest.name}${exportName.slice(1)}`] = path.join(root, `packages/${name}`, resolvedTarget);
    }
  }
  return aliases;
}

export function frameworkCompilerOptions(framework) {
  if (framework === 'react') return { jsx: 'react' };
  if (framework === 'angular') return { experimentalDecorators: true, useDefineForClassFields: false };
  if (framework === 'vue' || framework === 'elements') return {};
  throw new Error(`Unsupported documentation example framework: ${framework}`);
}

export async function compileFrameworkExample({ root, framework, sourcePath, outputPath, aliases }) {
  await build({
    entryPoints: [sourcePath],
    alias: aliases,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2022'],
    legalComments: 'none',
    tsconfigRaw: { compilerOptions: frameworkCompilerOptions(framework) },
    outfile: outputPath,
  });
}
