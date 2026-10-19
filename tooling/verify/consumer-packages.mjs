import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const allowed = ['core', 'web', 'react', 'angular', 'vue', 'elements'];
const dependencies = { core: [], web: ['core'], react: ['core', 'web'], angular: ['core', 'web'], vue: ['core', 'web'], elements: ['core', 'web'] };
const requestedArg = process.argv[2] || 'all';
const requested = requestedArg === 'all' ? allowed : requestedArg.split(',').filter(Boolean);
for (const name of requested) if (!allowed.includes(name)) throw new Error(`Unknown consumer scope: ${name}`);

const closure = new Set();
function include(name) { if (closure.has(name)) return; for (const dependency of dependencies[name]) include(dependency); closure.add(name); }
for (const name of requested) include(name);

const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'vyrnforge-consumer-'));
const tarballDir = path.join(temporaryRoot, 'tarballs');
const consumerDir = path.join(temporaryRoot, 'consumer');
await mkdir(tarballDir, { recursive: true });
await mkdir(consumerDir, { recursive: true });

try {
  const tarballs = [];
  for (const name of closure) {
    const raw = execFileSync('npm', ['pack', '--json', '--pack-destination', tarballDir, path.resolve('packages', name)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
    const result = JSON.parse(raw)[0];
    if (!result?.filename) throw new Error(`npm pack did not produce a tarball for ${name}`);
    tarballs.push(path.join(tarballDir, result.filename));
  }

  await writeFile(path.join(consumerDir, 'package.json'), `${JSON.stringify({ name: 'vyrnforge-bootstrap-consumer', private: true, type: 'module' }, null, 2)}\n`);
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false', ...tarballs], { cwd: consumerDir, stdio: 'inherit' });

  const imports = requested.map((name) => `await import('@vyrnforge/${name}');`).join('\n');
  const buttonImports = requested.filter((name) => ['react', 'angular', 'vue'].includes(name)).map((name) => `await import('@vyrnforge/${name}/button');`).join('\n');
  const webCheck = requested.includes('web') || requested.some((name) => dependencies[name].includes('web')) ? `
const stylesheet = import.meta.resolve('@vyrnforge/web/styles.css');
const css = await readFile(new URL(stylesheet), 'utf8');
if (!css.includes('vyrnforge.components')) throw new Error('Consumer-resolved canonical stylesheet is invalid');
const buttonStylesheet = import.meta.resolve('@vyrnforge/web/styles/button.css');
const buttonCss = await readFile(new URL(buttonStylesheet), 'utf8');
if (!buttonCss.includes('[data-vf-button]')) throw new Error('Consumer-resolved Button stylesheet is invalid');` : '';
  await writeFile(path.join(consumerDir, 'verify.mjs'), `import { readFile } from 'node:fs/promises';\n${imports}\n${buttonImports}\n${webCheck}\nprocess.stdout.write('consumer imports: ok\\n');\n`);
  execFileSync(process.execPath, ['verify.mjs'], { cwd: consumerDir, stdio: 'inherit' });

  for (const name of closure) {
    const manifest = JSON.parse(await readFile(path.join(consumerDir, 'node_modules', '@vyrnforge', name, 'package.json'), 'utf8'));
    if (manifest.name !== `@vyrnforge/${name}`) throw new Error(`Installed consumer package mismatch for ${name}`);
  }
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

process.stdout.write(`packed consumer verification: ${requested.join(', ')} ok\n`);
