import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageDefinition, publicPackageNames } from './public-package-model.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputRoot = path.join(root, 'tmp/package-validation');
const tarballRoot = path.join(outputRoot, 'tarballs');
const rootManifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: options.capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    ...options,
  });
}

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function requestedPackageNames() {
  const raw = arg('--packages') ?? process.env.VF_PACKAGE_SCOPE ?? '';
  if (!raw.trim()) return [...publicPackageNames];
  const selected = [...new Set(raw.split(',').map((value) => value.trim()).filter(Boolean))].sort();
  const unknown = selected.filter((name) => !publicPackageNames.includes(name));
  if (unknown.length) throw new Error(`Unknown packed-package scope: ${unknown.join(', ')}`);
  return selected;
}

function internalPackageName(specifier) {
  return /^@vyrnforge\/([^/]+)$/.exec(specifier)?.[1] ?? null;
}

function packageDependencyClosure(selected) {
  const closure = new Set();
  const visit = (name) => {
    if (closure.has(name)) return;
    closure.add(name);
    for (const dependency of packageDefinition(name)?.internalDependencies ?? []) {
      const dependencyName = internalPackageName(dependency);
      if (dependencyName) visit(dependencyName);
    }
  };
  for (const name of selected) visit(name);
  return publicPackageNames.filter((name) => closure.has(name));
}

function rootVersion(name) {
  const version = rootManifest.devDependencies?.[name]
    ?? rootManifest.dependencies?.[name]
    ?? rootManifest.peerDependencies?.[name];
  if (!version || version.startsWith('workspace:')) {
    throw new Error(`Packed consumer requires a pinned root dependency version for ${name}`);
  }
  return version;
}

function flattenExportTargets(value, targets = []) {
  if (typeof value === 'string') targets.push(value);
  else if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) flattenExportTargets(nested, targets);
  }
  return targets;
}

function publicModuleSpecifiers(manifest) {
  const specifiers = [];
  for (const [subpath, target] of Object.entries(manifest.exports ?? {})) {
    if (subpath !== '.' && !subpath.startsWith('./')) continue;
    if (subpath.includes('*')) {
      throw new Error(`${manifest.name} uses wildcard public export ${subpath}; packed-consumer enumeration requires explicit public module subpaths`);
    }
    if (subpath === './package.json' || subpath.endsWith('.css')) continue;
    const targets = flattenExportTargets(target);
    if (!targets.some((entry) => /\.(?:[cm]?js)$/.test(entry))) continue;
    specifiers.push(subpath === '.' ? manifest.name : `${manifest.name}/${subpath.slice(2)}`);
  }
  return specifiers;
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

const requestedPackages = requestedPackageNames();
const validationPackages = packageDependencyClosure(requestedPackages);

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(tarballRoot, { recursive: true });

const projects = validationPackages.map((name) => `@vyrnforge/${name}`).join(',');
run('pnpm', ['exec', 'nx', 'run-many', '-t', 'build', `--projects=${projects}`]);
run('node', ['tooling/verify/package-contracts.mjs']);
run('node', ['tooling/verify/api-reports.mjs', '--packages', validationPackages.join(',')]);

const tarballs = new Map();
const publicSpecifiers = new Set();
for (const name of validationPackages) {
  const packageRoot = path.join(root, 'packages', name);
  if (!existsSync(path.join(packageRoot, 'dist'))) throw new Error(`@vyrnforge/${name} did not produce a dist directory`);

  const stage = path.join(outputRoot, 'staging', name);
  mkdirSync(stage, { recursive: true });
  cpSync(path.join(packageRoot, 'dist'), path.join(stage, 'dist'), { recursive: true });

  const manifest = releaseManifest(JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8')));
  for (const specifier of publicModuleSpecifiers(manifest)) publicSpecifiers.add(specifier);
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
  const dependencies = Object.fromEntries(validationPackages.map((name) => [`@vyrnforge/${name}`, `file:${tarballs.get(name)}`]));
  dependencies.typescript = rootVersion('typescript');
  if (validationPackages.includes('angular')) {
    Object.assign(dependencies, {
      '@angular/common': rootVersion('@angular/common'),
      '@angular/compiler': rootVersion('@angular/compiler'),
      '@angular/core': rootVersion('@angular/core'),
      '@angular/platform-browser': rootVersion('@angular/platform-browser'),
      '@angular/platform-server': rootVersion('@angular/platform-server'),
      rxjs: rootVersion('rxjs'),
    });
  }
  if (validationPackages.includes('react')) {
    Object.assign(dependencies, {
      '@types/react': rootVersion('@types/react'),
      '@types/react-dom': rootVersion('@types/react-dom'),
      react: rootVersion('react'),
      'react-dom': rootVersion('react-dom'),
    });
  }
  if (validationPackages.includes('vue')) dependencies.vue = rootVersion('vue');
  writeFileSync(path.join(consumerRoot, 'package.json'), `${JSON.stringify({ name: 'vyrnforge-packed-consumer', private: true, type: 'module', dependencies }, null, 2)}\n`);

  const sortedSpecifiers = [...publicSpecifiers].sort();
  writeFileSync(
    path.join(consumerRoot, 'smoke.mjs'),
    `${validationPackages.includes('angular') ? "import '@angular/compiler';\\n" : ''}const publicSpecifiers=${JSON.stringify(sortedSpecifiers)};\nawait Promise.all(publicSpecifiers.map((specifier)=>import(specifier)));\nconst privateSpecifiers=${JSON.stringify(validationPackages.flatMap((name) => [`@vyrnforge/${name}/internal`, `@vyrnforge/${name}/src/index.js`]))};\nfor(const specifier of privateSpecifiers){try{await import(specifier);throw new Error('private subpath unexpectedly importable: '+specifier)}catch(error){if(error?.message?.startsWith('private subpath unexpectedly importable:'))throw error;if(error?.code!=='ERR_PACKAGE_PATH_NOT_EXPORTED')throw error;}}\n`,
  );

  const typeImports = sortedSpecifiers
    .map((specifier, index) => `import type * as Surface${index} from ${JSON.stringify(specifier)};`)
    .join('\n');
  const typeTuple = sortedSpecifiers.map((_, index) => `typeof Surface${index}`).join(',');
  writeFileSync(
    path.join(consumerRoot, 'consumer.ts'),
    `${typeImports}\nexport type PackedConsumerSurface=[${typeTuple}];\n`,
  );
  writeFileSync(path.join(consumerRoot, 'tsconfig.json'), `${JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', strict: true, noEmit: true, skipLibCheck: false }, include: ['consumer.ts'] }, null, 2)}\n`);
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: consumerRoot });
  run('npm', ['exec', '--', 'tsc', '-p', 'tsconfig.json'], { cwd: consumerRoot });
  run(process.execPath, ['smoke.mjs'], { cwd: consumerRoot });
} finally {
  rmSync(consumerRoot, { recursive: true, force: true });
}

console.log(
  `Validated requested packages ${requestedPackages.join(', ')} using dependency closure ${validationPackages.join(', ')} ` +
  `and ${publicSpecifiers.size} explicit public module entrypoints with package contracts, API Extractor, publint, attw, and an installed tarball consumer.`,
);
