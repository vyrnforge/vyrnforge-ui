import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

function releaseManifest(manifest) {
  const result = structuredClone(manifest);
  delete result.private;
  for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
    for (const [name, value] of Object.entries(result[field] ?? {})) {
      if (typeof value === 'string' && value.startsWith('workspace:')) result[field][name] = '0.0.0-rebuild';
    }
  }

  // The Angular workspace manifest describes build outputs under ./dist. Its
  // release manifest must also use standards-compliant condition ordering and
  // expose package metadata from the packed root.
  if (result.name === '@vyrnforge/angular') {
    for (const [entrypoint, target] of Object.entries(result.exports ?? {})) {
      if (entrypoint === './package.json') {
        result.exports[entrypoint] = './package.json';
        continue;
      }
      if (target && typeof target === 'object' && typeof target.types === 'string' && typeof target.import === 'string') {
        result.exports[entrypoint] = {
          types: target.types,
          import: { types: target.types, default: target.import },
          default: target.default ?? target.import,
        };
      }
    }
  }
  return result;
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(tarballRoot, { recursive: true });
run('pnpm', ['exec', 'nx', 'run-many', '-t', 'build']);
run('node', ['tooling/verify/package-contracts.mjs']);
run('node', ['tooling/verify/api-reports.mjs']);

const tarballs = new Map();
for (const name of packageNames) {
  const packageRoot = path.join(root, 'packages', name);
  if (!existsSync(path.join(packageRoot, 'dist'))) throw new Error(`@vyrnforge/${name} did not produce a dist directory`);

  const stage = path.join(outputRoot, 'staging', name);
  mkdirSync(stage, { recursive: true });
  cpSync(path.join(packageRoot, 'dist'), path.join(stage, 'dist'), { recursive: true });

  const manifest = releaseManifest(JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8')));
  writeFileSync(path.join(stage, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  const packedOutput = run('npm', ['pack', '--ignore-scripts', '--pack-destination', tarballRoot], { cwd: stage, capture: true }).trim();
  const packedPath = packedOutput.split(/\r?\n/).at(-1);
  const tarballPath = path.resolve(tarballRoot, path.basename(packedPath));
  if (!existsSync(tarballPath)) throw new Error(`package pack did not produce ${tarballPath}`);
  tarballs.set(name, tarballPath);

  run('pnpm', ['exec', 'publint', tarballPath, '--strict']);

  const cssEntrypoints = Object.keys(manifest.exports ?? {})
    .filter((entrypoint) => entrypoint.endsWith('.css'))
    .map((entrypoint) => entrypoint.replace(/^\.\//, ''));
  const attwArgs = ['exec', 'attw', tarballPath, '--profile', 'esm-only'];
  if (name === 'angular') attwArgs.push('--ignore-rules', 'internal-resolution-error');
  if (cssEntrypoints.length > 0) attwArgs.push('--exclude-entrypoints', ...cssEntrypoints);
  run('pnpm', attwArgs);
}

const consumerRoot = mkdtempSync(path.join(tmpdir(), 'vyrnforge-packed-consumer-'));
try {
  const dependencies = Object.fromEntries(packageNames.map((name) => [`@vyrnforge/${name}`, `file:${tarballs.get(name)}`]));
  Object.assign(dependencies, {
    '@angular/common': '22.2.3',
    '@angular/compiler': '22.2.3',
    '@angular/core': '22.2.3',
    '@angular/platform-browser': '22.2.3',
    '@angular/platform-server': '22.2.3',
    '@types/react': '19.3.0',
    '@types/react-dom': '19.3.0',
    react: '19.3.0',
    'react-dom': '19.3.0',
    rxjs: '7.8.2',
    typescript: '6.0.3',
    vue: '3.5.44',
  });
  writeFileSync(path.join(consumerRoot, 'package.json'), `${JSON.stringify({ name: 'vyrnforge-packed-consumer', private: true, type: 'module', dependencies }, null, 2)}\n`);
  writeFileSync(path.join(consumerRoot, 'smoke.mjs'), `import '@angular/compiler';\nawait Promise.all([import('@vyrnforge/core'),import('@vyrnforge/web'),import('@vyrnforge/icons'),import('@vyrnforge/react'),import('@vyrnforge/react/button'),import('@vyrnforge/angular'),import('@vyrnforge/angular/button'),import('@vyrnforge/vue'),import('@vyrnforge/vue/button'),import('@vyrnforge/elements'),import('@vyrnforge/elements/icon')]);\nconst privateSpecifiers=${JSON.stringify(packageNames.flatMap((name) => [`@vyrnforge/${name}/internal`, `@vyrnforge/${name}/src/index.js`]))};\nfor(const specifier of privateSpecifiers){try{await import(specifier);throw new Error('private subpath unexpectedly importable: '+specifier)}catch(error){if(error?.message?.startsWith('private subpath unexpectedly importable:'))throw error;if(error?.code!=='ERR_PACKAGE_PATH_NOT_EXPORTED')throw error;}}\n`);
  writeFileSync(path.join(consumerRoot, 'consumer.ts'), `import type * as Core from '@vyrnforge/core';\nimport type * as ReactPort from '@vyrnforge/react/button';\nimport type * as AngularPort from '@vyrnforge/angular/button';\nimport type * as VuePort from '@vyrnforge/vue/button';\nimport type * as ElementsPort from '@vyrnforge/elements/icon';\nexport type PackedConsumerSurface=[typeof Core,typeof ReactPort,typeof AngularPort,typeof VuePort,typeof ElementsPort];\n`);
  writeFileSync(path.join(consumerRoot, 'tsconfig.json'), `${JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', strict: true, noEmit: true, skipLibCheck: false }, include: ['consumer.ts'] }, null, 2)}\n`);
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: consumerRoot });
  run('npm', ['exec', '--', 'tsc', '-p', 'tsconfig.json'], { cwd: consumerRoot });
  run(process.execPath, ['smoke.mjs'], { cwd: consumerRoot });
} finally {
  rmSync(consumerRoot, { recursive: true, force: true });
}

console.log(`Validated ${packageNames.length} packed public packages with package contracts, API Extractor, publint, attw, and an installed tarball consumer.`);