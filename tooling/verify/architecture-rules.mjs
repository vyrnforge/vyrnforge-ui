import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const packageNames = ['core', 'web', 'react', 'angular', 'vue', 'elements'];
const portNames = ['react', 'angular', 'vue', 'elements'];
const expectedWorkspace = packageNames.map((name) => `packages/${name}`);
const rootManifest = JSON.parse(await readFile('package.json', 'utf8'));

if (JSON.stringify(rootManifest.workspaces) !== JSON.stringify(expectedWorkspace)) {
  throw new Error(`Root workspaces must contain only the approved public package graph: ${expectedWorkspace.join(', ')}`);
}

const coreTsconfig = JSON.parse(await readFile('packages/core/tsconfig.json', 'utf8'));
if (JSON.stringify(coreTsconfig.compilerOptions?.lib) !== JSON.stringify(['ES2022'])) {
  throw new Error('@vyrnforge/core must compile without DOM libraries');
}

const expectedLayerOrder = '@layer vyrnforge.reset, vyrnforge.tokens, vyrnforge.themes, vyrnforge.foundation, vyrnforge.components;';
const webCss = (await readFile('packages/web/src/styles.css', 'utf8')).trim();
if (!webCss.startsWith(expectedLayerOrder)) {
  throw new Error('@vyrnforge/web must own the canonical documented cascade-layer order');
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

for (const port of portNames) {
  const files = await walk(`packages/${port}/src`);
  for (const file of files) {
    if (file.endsWith('.css')) throw new Error(`${file} defines port-local CSS; canonical component styling belongs to @vyrnforge/web`);
    if (!/\.(?:[cm]?[jt]sx?)$/.test(file)) continue;
    const source = await readFile(file, 'utf8');
    if (/\bimport\s+['"][^'"]+\.css['"]/.test(source)) {
      throw new Error(`${file} imports CSS directly; public CSS consumption must remain explicit`);
    }
    if (/\bcustomElements\.define\s*\(/.test(source) && !file.includes(`${path.sep}register${path.sep}`)) {
      throw new Error(`${file} registers a Custom Element outside an explicit register/* entrypoint`);
    }
  }
}

for (const name of packageNames) {
  const manifest = JSON.parse(await readFile(`packages/${name}/package.json`, 'utf8'));
  if (name !== 'web' && manifest.sideEffects !== false) {
    throw new Error(`${manifest.name} must remain side-effect-free by default`);
  }
}

process.stdout.write('architecture rules: ok\n');
