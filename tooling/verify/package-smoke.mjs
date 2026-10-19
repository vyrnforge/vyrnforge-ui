import { execFileSync } from 'node:child_process';
import { access } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const allPackages = ['core', 'web', 'react', 'angular', 'vue', 'elements'];
const requested = process.argv.slice(2);
const packages = requested.length ? requested : allPackages;

for (const name of packages) {
  if (!allPackages.includes(name)) throw new Error(`Unknown package smoke scope: ${name}`);
  const packageDir = path.resolve('packages', name);
  await access(path.join(packageDir, 'dist', 'index.js'));
  await access(path.join(packageDir, 'dist', 'index.d.ts'));
  await import(pathToFileURL(path.join(packageDir, 'dist', 'index.js')).href);

  const raw = execFileSync('npm', ['pack', '--json', '--dry-run', packageDir], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  const result = JSON.parse(raw)[0];
  if (!result || result.name !== `@vyrnforge/${name}`) throw new Error(`Unexpected npm pack result for ${name}`);
  const files = (result.files ?? []).map((file) => file.path);
  if (files.some((file) => file.startsWith('src/') || file.includes('legacy') || file.startsWith('tooling/'))) throw new Error(`${name} tarball exposes source, legacy, or repository tooling`);
  if (!files.includes('dist/index.js') || !files.includes('dist/index.d.ts')) throw new Error(`${name} tarball is missing built public entrypoints`);
  if (name === 'web') {
    for (const file of ['dist/styles.css', 'dist/styles/button.css', 'dist/styles/tokens.css']) if (!files.includes(file)) throw new Error(`@vyrnforge/web tarball is missing ${file}`);
  }
  if (['react', 'angular', 'vue'].includes(name)) {
    for (const file of ['dist/button.js', 'dist/button.d.ts']) if (!files.includes(file)) throw new Error(`@vyrnforge/${name} tarball is missing ${file}`);
  }
}

process.stdout.write(`package smoke: ${packages.join(', ')} ok\n`);
