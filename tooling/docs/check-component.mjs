import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { discoverProductUnits } from '../testing/discover-product-units.mjs';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const componentId = process.argv[2];
if (!componentId) throw new Error('Usage: node tooling/docs/check-component.mjs <component>');
const discovery = discoverProductUnits(root);
const component = discovery.components.find((entry) => entry.component === componentId);
if (!component) throw new Error(`Unknown component documentation owner: ${componentId}`);

function exportTarget(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return null;
  return value.import || value.default || Object.values(value).find((entry) => typeof entry === 'string') || null;
}
function sourceAliases() {
  const aliases = {};
  for (const { name, manifest } of discovery.packages) {
    for (const [exportName, value] of Object.entries(manifest.exports ?? {})) {
      const target = exportTarget(value);
      if (!target?.startsWith('./dist/')) continue;
      const specifier = exportName === '.' ? manifest.name : `${manifest.name}${exportName.slice(1)}`;
      aliases[specifier] = path.join(root, `packages/${name}`, target.replace(/^\.\/dist\//, 'src/'));
    }
  }
  return aliases;
}
async function manifestsUnder(directory) {
  const results = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(target);
      else if (entry.name === 'example.json') results.push(target);
    }
  }
  await walk(directory);
  return results.sort();
}

const docsHtml = await readFile(path.join(root, component.documentationSource), 'utf8');
const referencedExamples = new Set([...docsHtml.matchAll(/data-vf-example="([^"]+)"/g)].map((match) => match[1]));
const exampleRoot = path.join(root, `components/${componentId}/examples`);
const manifests = await manifestsUnder(exampleRoot);
if (manifests.length === 0) throw new Error(`${componentId} has no executable documentation examples`);
const aliases = sourceAliases();
const temp = await mkdtemp(path.join(os.tmpdir(), `vf-docs-${componentId}-`));
const found = new Set();
try {
  for (const manifestPath of manifests) {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const directory = path.dirname(manifestPath);
    const relativeId = path.relative(exampleRoot, directory).replaceAll(path.sep, '/');
    const expectedId = `${componentId}/${relativeId}`;
    if (manifest.id !== expectedId) throw new Error(`Example id ${manifest.id} must match ${expectedId}`);
    if (!manifest.frameworks?.[manifest.defaultFramework]) throw new Error(`Example ${manifest.id} has invalid defaultFramework`);
    found.add(manifest.id);
    for (const [framework, config] of Object.entries(manifest.frameworks ?? {})) {
      const sourcePath = path.join(directory, config.source);
      await readFile(sourcePath, 'utf8');
      if (framework === 'native-web') continue;
      await build({
        entryPoints: [sourcePath],
        alias: aliases,
        bundle: true,
        write: false,
        format: 'iife',
        platform: 'browser',
        target: ['es2022'],
        legalComments: 'none',
        tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false, jsx: 'react' } },
      });
    }
  }
  for (const exampleId of referencedExamples) if (!found.has(exampleId)) throw new Error(`${componentId} docs reference unknown example ${exampleId}`);
} finally {
  await rm(temp, { recursive: true, force: true });
}
process.stdout.write(`component documentation: ${componentId} ok (${manifests.length} examples)\n`);
