import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const packageNames = ['core', 'web', 'react', 'angular', 'vue', 'elements'];
const allowed = {
  core: new Set(),
  web: new Set(['@vyrnforge/core']),
  react: new Set(['@vyrnforge/core', '@vyrnforge/web']),
  angular: new Set(['@vyrnforge/core', '@vyrnforge/web']),
  vue: new Set(['@vyrnforge/core', '@vyrnforge/web']),
  elements: new Set(['@vyrnforge/core', '@vyrnforge/web'])
};
const dependencyFields = ['dependencies', 'peerDependencies', 'optionalDependencies', 'devDependencies'];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (/\.(?:[cm]?[jt]sx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

for (const name of packageNames) {
  const manifestPath = new URL(`../../packages/${name}/package.json`, import.meta.url);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const declared = new Set();
  for (const field of dependencyFields) {
    for (const dependency of Object.keys(manifest[field] ?? {})) {
      if (dependency.startsWith('@vyrnforge/')) declared.add(dependency);
    }
  }
  for (const dependency of declared) {
    if (!allowed[name].has(dependency)) {
      throw new Error(`${manifest.name} has forbidden internal dependency ${dependency}`);
    }
  }

  const srcDir = path.resolve(`packages/${name}/src`);
  for (const file of await walk(srcDir)) {
    const source = await readFile(file, 'utf8');
    const imports = [
      ...source.matchAll(/(?:from\s+|import\s*\()\s*['"](@vyrnforge\/[a-z0-9-]+)/g)
    ].map((match) => match[1]);
    for (const dependency of imports) {
      if (!allowed[name].has(dependency)) {
        throw new Error(`${file} imports forbidden internal package ${dependency}`);
      }
    }
    if (name === 'core' && /\b(?:window|document|HTMLElement|Element|CustomEvent|customElements)\b/.test(source)) {
      throw new Error(`${file} references a DOM/browser global; @vyrnforge/core must remain DOM-free`);
    }
  }
}

process.stdout.write('package boundaries: ok\n');
