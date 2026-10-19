import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const rootManifest = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
const impact = JSON.parse(await readFile(new URL('../../testing/impact.json', import.meta.url), 'utf8'));
const workspaces = rootManifest.workspaces.filter((workspace) => workspace.startsWith('packages/'));
const packageNames = workspaces.map((workspace) => path.basename(workspace));
const packageNameSet = new Set(packageNames);
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

for (const [index, name] of packageNames.entries()) {
  const workspace = workspaces[index];
  const target = impact.targets[name];
  if (!target) throw new Error(`testing/impact.json is missing package policy for ${name}`);
  const allowed = new Set((target.dependsOn ?? []).filter((dependency) => packageNameSet.has(dependency)).map((dependency) => `@vyrnforge/${dependency}`));
  const manifest = JSON.parse(await readFile(new URL(`../../${workspace}/package.json`, import.meta.url), 'utf8'));
  const declared = new Set();
  for (const field of dependencyFields) {
    for (const dependency of Object.keys(manifest[field] ?? {})) {
      if (dependency.startsWith('@vyrnforge/')) declared.add(dependency);
    }
  }
  for (const dependency of declared) {
    if (!allowed.has(dependency)) throw new Error(`${manifest.name} has forbidden internal dependency ${dependency}`);
  }

  const srcDir = path.resolve(workspace, 'src');
  for (const file of await walk(srcDir)) {
    const source = await readFile(file, 'utf8');
    const imports = [...source.matchAll(/(?:from\s+|import\s*\()\s*['"](@vyrnforge\/[a-z0-9-]+)/g)].map((match) => match[1]);
    for (const dependency of imports) {
      if (!allowed.has(dependency)) throw new Error(`${file} imports forbidden internal package ${dependency}`);
    }
    if (name === 'core' && /\b(?:window|document|HTMLElement|Element|CustomEvent|customElements)\b/.test(source)) {
      throw new Error(`${file} references a DOM/browser global; @vyrnforge/core must remain DOM-free`);
    }
  }
}

process.stdout.write('package boundaries: ok\n');
