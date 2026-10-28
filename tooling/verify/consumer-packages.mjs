import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const rootManifest = JSON.parse(await readFile(path.resolve('package.json'), 'utf8'));
const allowed = (rootManifest.workspaces ?? [])
  .filter((workspace) => /^packages\/[^/*]+$/.test(workspace))
  .map((workspace) => path.posix.basename(workspace));
const manifests = new Map(await Promise.all(allowed.map(async (name) => [
  name,
  JSON.parse(await readFile(path.resolve('packages', name, 'package.json'), 'utf8')),
])));
const allowedSet = new Set(allowed);
const dependencies = new Map(allowed.map((name) => [
  name,
  Object.keys(manifests.get(name).dependencies ?? {})
    .filter((dependency) => dependency.startsWith('@vyrnforge/'))
    .map((dependency) => dependency.slice('@vyrnforge/'.length))
    .filter((dependency) => allowedSet.has(dependency)),
]));
const requestedArg = process.argv[2] || 'all';
const requested = requestedArg === 'all' ? allowed : requestedArg.split(',').filter(Boolean);
for (const name of requested) if (!allowedSet.has(name)) throw new Error(`Unknown consumer scope: ${name}`);
const closure = new Set();
function include(name) { if (closure.has(name)) return; for (const dependency of dependencies.get(name) ?? []) include(dependency); closure.add(name); }
for (const name of requested) include(name);
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'vyrnforge-consumer-'));
const tarballDir = path.join(temporaryRoot, 'tarballs');
const consumerDir = path.join(temporaryRoot, 'consumer');
await mkdir(tarballDir, { recursive: true });
await mkdir(consumerDir, { recursive: true });
function publicSpecifier(packageName, exportName) { return exportName === '.' ? packageName : `${packageName}${exportName.slice(1)}`; }
function importTarget(value) { if (typeof value === 'string') return value; if (!value || typeof value !== 'object') return null; return value.import || value.default || Object.values(value).find((entry) => typeof entry === 'string') || null; }
function flattenExportTargets(value, targets = []) { if (typeof value === 'string') targets.push(value); else if (value && typeof value === 'object') for (const nested of Object.values(value)) flattenExportTargets(nested, targets); return targets; }
function verifyPackedPayload(name, manifest, result) {
  if (!result || result.name !== `@vyrnforge/${name}` || !result.filename) throw new Error(`Unexpected pnpm pack result for ${name}`);
  const files = new Set((result.files ?? []).map((file) => file.path));
  if ([...files].some((file) => file.startsWith('src/') || file.includes('legacy') || file.startsWith('tooling/') || file.startsWith('test/'))) {
    throw new Error(`${name} tarball exposes source, tests, legacy, or repository tooling`);
  }
  const publishedTargets = new Set([manifest.main, manifest.types, ...flattenExportTargets(manifest.exports)].filter(Boolean));
  for (const target of publishedTargets) {
    const relative = target.replace(/^\.\//, '');
    if (!files.has(relative)) throw new Error(`${manifest.name} tarball is missing published artifact ${relative}`);
  }
}
try {
  const tarballs = [];
  for (const name of closure) {
    const manifest = manifests.get(name);
    const raw = execFileSync('pnpm', ['--dir', path.resolve('packages', name), 'pack', '--pack-destination', tarballDir], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
    const filename = path.basename(raw.trim().split(/\r?\n/).at(-1));
    const packedFiles = execFileSync('tar', ['-tzf', path.join(tarballDir, filename)], { encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean).map((entry) => ({ path: entry.replace(/^package\//, '') }));
    const result = { name: manifest.name, filename, files: packedFiles };
    verifyPackedPayload(name, manifest, result);
    tarballs.push(path.join(tarballDir, result.filename));
  }
  await writeFile(path.join(consumerDir, 'package.json'), `${JSON.stringify({ name: 'vyrnforge-bootstrap-consumer', private: true, type: 'module' }, null, 2)}\n`);
  execFileSync('pnpm', ['add', '--ignore-scripts', ...tarballs], { cwd: consumerDir, stdio: 'inherit' });
  const checks = [`import { readFile } from 'node:fs/promises';`];
  for (const name of requested) {
    const manifest = manifests.get(name);
    for (const [exportName, value] of Object.entries(manifest.exports ?? {})) {
      const specifier = publicSpecifier(manifest.name, exportName);
      const target = importTarget(value);
      if (!target) continue;
      if (target.endsWith('.css')) checks.push(`{ const url = import.meta.resolve(${JSON.stringify(specifier)}); const source = await readFile(new URL(url), 'utf8'); if (!source.length) throw new Error('Empty public CSS export: ${specifier}'); }`);
      else if (name === 'angular') checks.push(`{ const url = import.meta.resolve(${JSON.stringify(specifier)}); const source = await readFile(new URL(url), 'utf8'); if (!source.length) throw new Error('Empty Angular public export: ${specifier}'); }`);
      else if (target.endsWith('.js')) checks.push(`await import(${JSON.stringify(specifier)});`);
    }
  }
  if (requested.includes('icons')) checks.push(`{ const { bookmarkIcon } = await import('@vyrnforge/icons/bookmark'); if (bookmarkIcon.name !== 'bookmark') throw new Error('Granular Bookmark export did not resolve'); }`);
  checks.push(`process.stdout.write('consumer public exports: ok\\n');`);
  await writeFile(path.join(consumerDir, 'verify.mjs'), `${checks.join('\n')}\n`);
  execFileSync(process.execPath, ['verify.mjs'], { cwd: consumerDir, stdio: 'inherit' });
  for (const name of closure) {
    const manifest = JSON.parse(await readFile(path.join(consumerDir, 'node_modules', '@vyrnforge', name, 'package.json'), 'utf8'));
    if (manifest.name !== `@vyrnforge/${name}`) throw new Error(`Installed consumer package mismatch for ${name}`);
    for (const range of Object.values(manifest.dependencies ?? {})) if (typeof range === 'string' && range.startsWith('workspace:')) throw new Error(`${manifest.name} packed manifest leaked workspace protocol`);
  }
} finally { await rm(temporaryRoot, { recursive: true, force: true }); }
process.stdout.write(`packed consumer verification: ${requested.join(', ')} ok\n`);
