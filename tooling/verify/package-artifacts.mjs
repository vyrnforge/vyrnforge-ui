import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packageNames = ['core', 'web', 'icons', 'react', 'angular', 'vue', 'elements'];
const outputRoot = path.join(root, 'tmp/package-validation');
const tarballRoot = path.join(outputRoot, 'tarballs');

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    ...options,
  });
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(tarballRoot, { recursive: true });

run('pnpm', ['exec', 'nx', 'run-many', '-t', 'build']);

for (const name of packageNames) {
  const packageRoot = path.join(root, 'packages', name);
  if (!existsSync(path.join(packageRoot, 'dist'))) {
    throw new Error(`@vyrnforge/${name} did not produce a dist directory`);
  }

  const packedOutput = run('pnpm', ['pack', '--pack-destination', tarballRoot], {
    cwd: packageRoot,
    capture: true,
  }).trim();
  const tarballName = packedOutput.split(/\r?\n/).at(-1);
  const tarballPath = path.isAbsolute(tarballName) ? tarballName : path.resolve(packageRoot, tarballName);

  run('pnpm', ['exec', 'publint', tarballPath, '--strict']);
  run('pnpm', ['exec', 'attw', '--profile', 'node16', tarballPath]);
}

console.log(`Validated ${packageNames.length} packed public packages with publint and attw.`);
