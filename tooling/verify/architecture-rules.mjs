import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const packageNames = ['core', 'web', 'icons', 'react', 'angular', 'vue', 'elements'];
const portNames = ['react', 'angular', 'vue', 'elements'];
const expectedWorkspace = packageNames.map((name) => `packages/${name}`);
const workspaceYaml = await readFile('pnpm-workspace.yaml', 'utf8');
const workspaceEntries = [...workspaceYaml.matchAll(/^\s*-\s+['"]?([^'"\s]+)['"]?\s*$/gm)].map((match) => match[1]);
if (JSON.stringify(workspaceEntries) !== JSON.stringify(expectedWorkspace)) throw new Error(`pnpm workspace must contain only the approved public package graph: ${expectedWorkspace.join(', ')}`);
const rootManifest = JSON.parse(await readFile('package.json', 'utf8'));
if (rootManifest.workspaces) throw new Error('pnpm-workspace.yaml, not package.json, must own workspace membership');
if (!rootManifest.devDependencies?.['@playwright/test']) throw new Error('Real-browser validation tooling must be repository-owned');

const coreTsconfig = JSON.parse(await readFile('packages/core/tsconfig.json', 'utf8'));
if (JSON.stringify(coreTsconfig.compilerOptions?.lib) !== JSON.stringify(['ES2022'])) throw new Error('@vyrnforge/core must compile without DOM libraries');

const expectedLayerOrder = '@layer vyrnforge.reset, vyrnforge.tokens, vyrnforge.themes, vyrnforge.foundation, vyrnforge.components;';
const webCss = (await readFile('packages/web/src/styles.css', 'utf8')).trim();
if (!webCss.startsWith(expectedLayerOrder)) throw new Error('@vyrnforge/web must own the canonical documented cascade-layer order');

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
    if (/\bimport\s+['"][^'"]+\.css['"]/.test(source)) throw new Error(`${file} imports CSS directly; public CSS consumption must remain explicit`);
    if (/\bcustomElements\.define\s*\(/.test(source) && !file.includes(`${path.sep}register${path.sep}`)) throw new Error(`${file} registers a Custom Element outside an explicit register/* entrypoint`);
  }
}

for (const name of packageNames) {
  const manifest = JSON.parse(await readFile(`packages/${name}/package.json`, 'utf8'));
  if (manifest.dependencies?.['@playwright/test'] || manifest.peerDependencies?.['@playwright/test']) throw new Error(`${manifest.name} must not depend on repository-only browser tooling`);
  if (name !== 'web' && manifest.sideEffects !== false) throw new Error(`${manifest.name} must remain side-effect-free by default`);
}

const iconsManifest = JSON.parse(await readFile('packages/icons/package.json', 'utf8'));
if (iconsManifest.dependencies?.['@vyrnforge/web'] !== 'workspace:*') throw new Error('@vyrnforge/icons must depend on the shared Web Icon contract through the workspace protocol');
for (const port of portNames) {
  const manifest = JSON.parse(await readFile(`packages/${port}/package.json`, 'utf8'));
  if (manifest.dependencies?.['@vyrnforge/icons'] || manifest.peerDependencies?.['@vyrnforge/icons']) throw new Error(`${manifest.name} must not depend on the optional official icon catalog`);
}

process.stdout.write('architecture rules: ok\n');
