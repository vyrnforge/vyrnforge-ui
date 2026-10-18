import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const packageNames = ['core', 'web', 'react', 'angular', 'vue', 'elements'];
const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'vyrnforge-consumer-'));
const tarballDir = path.join(temporaryRoot, 'tarballs');
const consumerDir = path.join(temporaryRoot, 'consumer');
await mkdir(tarballDir, { recursive: true });
await mkdir(consumerDir, { recursive: true });

try {
  const tarballs = [];
  for (const name of packageNames) {
    const raw = execFileSync('npm', ['pack', '--json', '--pack-destination', tarballDir, path.resolve('packages', name)], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit']
    });
    const result = JSON.parse(raw)[0];
    if (!result?.filename) throw new Error(`npm pack did not produce a tarball for ${name}`);
    tarballs.push(path.join(tarballDir, result.filename));
  }

  await writeFile(path.join(consumerDir, 'package.json'), `${JSON.stringify({ name: 'vyrnforge-bootstrap-consumer', private: true, type: 'module' }, null, 2)}\n`);
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', ...tarballs], {
    cwd: consumerDir,
    stdio: 'inherit'
  });

  const verification = `
import { readFile } from 'node:fs/promises';
const packages = ['core', 'web', 'react', 'angular', 'vue', 'elements'];
for (const name of packages) await import('@vyrnforge/' + name);
const stylesheet = import.meta.resolve('@vyrnforge/web/styles.css');
const css = await readFile(new URL(stylesheet), 'utf8');
if (!css.includes('@layer vyrnforge.reset, vyrnforge.tokens, vyrnforge.themes, vyrnforge.foundation, vyrnforge.components;')) {
  throw new Error('Consumer-resolved canonical stylesheet is invalid');
}
process.stdout.write('consumer imports: ok\\n');
`;
  const verificationPath = path.join(consumerDir, 'verify.mjs');
  await writeFile(verificationPath, verification);
  execFileSync(process.execPath, [verificationPath], { cwd: consumerDir, stdio: 'inherit' });

  for (const name of packageNames) {
    const manifest = JSON.parse(await readFile(path.join(consumerDir, 'node_modules', '@vyrnforge', name, 'package.json'), 'utf8'));
    if (manifest.name !== `@vyrnforge/${name}`) throw new Error(`Installed consumer package mismatch for ${name}`);
    if ((manifest.files ?? []).some((entry) => String(entry).includes('src'))) throw new Error(`${manifest.name} exposes source in its publish contract`);
  }
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

process.stdout.write('packed consumer verification: ok\n');
