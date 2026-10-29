import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const packageNames = ['core', 'web', 'icons', 'react', 'angular', 'vue', 'elements'];
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
  const workspace = `packages/${name}`;
  const manifest = JSON.parse(await readFile(new URL(`../../${workspace}/package.json`, import.meta.url), 'utf8'));
  const allowed = new Set();
  for (const field of dependencyFields) {
    for (const dependency of Object.keys(manifest[field] ?? {})) {
      if (dependency.startsWith('@vyrnforge/')) allowed.add(dependency);
    }
  }

  const srcDir = path.resolve(workspace, 'src');
  for (const file of await walk(srcDir)) {
    const source = await readFile(file, 'utf8');
    const imports = [...source.matchAll(/(?:from\s+|import\s*\()\s*['"](@vyrnforge\/[a-z0-9-]+)/g)].map((match) => match[1]);
    for (const dependency of imports) {
      if (!allowed.has(dependency) && dependency !== manifest.name) throw new Error(`${file} imports undeclared internal package ${dependency}`);
    }
    if (name === 'core' && /\b(?:window|document|HTMLElement|Element|CustomEvent|customElements)\b/.test(source)) {
      throw new Error(`${file} references a DOM/browser global; @vyrnforge/core must remain DOM-free`);
    }
  }
}

process.stdout.write('package boundaries: public workspace imports are declared and core remains DOM-free\n');
