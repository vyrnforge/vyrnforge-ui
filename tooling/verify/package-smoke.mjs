import { execFileSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const allPackages = ['core', 'web', 'icons', 'react', 'angular', 'vue', 'elements'];
const requested = process.argv.slice(2);
const packages = requested.length ? requested : allPackages;
function flattenExportTargets(value, targets = []) { if (typeof value === 'string') targets.push(value); else if (value && typeof value === 'object') for (const nested of Object.values(value)) flattenExportTargets(nested, targets); return targets; }
for (const name of packages) {
  if (!allPackages.includes(name)) throw new Error(`Unknown package smoke scope: ${name}`);
  const packageDir = path.resolve('packages', name);
  const manifest = JSON.parse(await readFile(path.join(packageDir, 'package.json'), 'utf8'));
  await access(path.join(packageDir, 'dist', 'index.js'));
  await access(path.join(packageDir, 'dist', 'index.d.ts'));
  if (name !== 'angular') await import(pathToFileURL(path.join(packageDir, 'dist', 'index.js')).href);
  const raw = execFileSync('npm', ['pack', '--json', '--dry-run', packageDir], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  const result = JSON.parse(raw)[0];
  if (!result || result.name !== `@vyrnforge/${name}`) throw new Error(`Unexpected npm pack result for ${name}`);
  const files = new Set((result.files ?? []).map((file) => file.path));
  if ([...files].some((file) => file.startsWith('src/') || file.includes('legacy') || file.startsWith('tooling/') || file.startsWith('test/'))) throw new Error(`${name} tarball exposes source, tests, legacy, or repository tooling`);
  for (const target of new Set(flattenExportTargets(manifest.exports))) {
    const relative = target.replace(/^\.\//, '');
    if (!files.has(relative)) throw new Error(`${manifest.name} tarball is missing exported artifact ${relative}`);
  }
}
process.stdout.write(`package smoke: ${packages.join(', ')} public exports ok\n`);
