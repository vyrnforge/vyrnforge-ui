import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packageNames = ['core', 'web', 'icons', 'react', 'angular', 'vue', 'elements'];
const outputRoot = path.join(root, 'tmp/package-validation');
const tarballRoot = path.join(outputRoot, 'tarballs');

function run(command, args, options = {}) {
  return execFileSync(command, args, { cwd: root, encoding: 'utf8', stdio: options.capture ? ['ignore', 'pipe', 'inherit'] : 'inherit', ...options });
}

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(tarballRoot, { recursive: true });
run('pnpm', ['exec', 'nx', 'run-many', '-t', 'build']);
run('node', ['tooling/verify/api-reports.mjs']);

const tarballs = new Map();
for (const name of packageNames) {
  const packageRoot = path.join(root, 'packages', name);
  if (!existsSync(path.join(packageRoot, 'dist'))) throw new Error(`@vyrnforge/${name} did not produce a dist directory`);
  const packedOutput = run('pnpm', ['--filter', `@vyrnforge/${name}`, 'pack', '--pack-destination', tarballRoot], { capture: true }).trim();
  const packedPath = packedOutput.split(/\r?\n/).at(-1);
  const tarballPath = path.isAbsolute(packedPath) ? packedPath : path.resolve(tarballRoot, path.basename(packedPath));
  if (!existsSync(tarballPath)) throw new Error(`pnpm pack did not produce ${tarballPath}`);
  tarballs.set(name, tarballPath);
  run('pnpm', ['exec', 'publint', tarballPath, '--strict']);
  run('pnpm', ['exec', 'attw', '--profile', 'node16', tarballPath]);
}

const consumerRoot = mkdtempSync(path.join(tmpdir(), 'vyrnforge-packed-consumer-'));
try {
  const dependencies = Object.fromEntries(packageNames.map((name) => [`@vyrnforge/${name}`, `file:${tarballs.get(name)}`]));
  Object.assign(dependencies, { '@angular/common':'22.2.3','@angular/compiler':'22.2.3','@angular/core':'22.2.3','@angular/platform-browser':'22.2.3','@angular/platform-server':'22.2.3','@types/react':'19.3.0','@types/react-dom':'19.3.0',react:'19.3.0','react-dom':'19.3.0',rxjs:'7.8.2',typescript:'6.0.3',vue:'3.5.44' });
  writeFileSync(path.join(consumerRoot,'package.json'), `${JSON.stringify({name:'vyrnforge-packed-consumer',private:true,type:'module',dependencies},null,2)}\n`);
  writeFileSync(path.join(consumerRoot,'smoke.mjs'), `import '@angular/compiler';\nawait Promise.all([import('@vyrnforge/core'),import('@vyrnforge/web'),import('@vyrnforge/icons'),import('@vyrnforge/react'),import('@vyrnforge/react/button'),import('@vyrnforge/angular'),import('@vyrnforge/angular/button'),import('@vyrnforge/vue'),import('@vyrnforge/vue/button'),import('@vyrnforge/elements'),import('@vyrnforge/elements/icon')]);\n`);
  writeFileSync(path.join(consumerRoot,'consumer.ts'), `import type * as Core from '@vyrnforge/core';\nimport type * as ReactPort from '@vyrnforge/react/button';\nimport type * as AngularPort from '@vyrnforge/angular/button';\nimport type * as VuePort from '@vyrnforge/vue/button';\nimport type * as ElementsPort from '@vyrnforge/elements/icon';\nexport type PackedConsumerSurface=[typeof Core,typeof ReactPort,typeof AngularPort,typeof VuePort,typeof ElementsPort];\n`);
  writeFileSync(path.join(consumerRoot,'tsconfig.json'), `${JSON.stringify({compilerOptions:{target:'ES2022',module:'NodeNext',moduleResolution:'NodeNext',strict:true,noEmit:true,skipLibCheck:false},include:['consumer.ts']},null,2)}\n`);
  run('pnpm',['install','--ignore-scripts'],{cwd:consumerRoot});
  run('pnpm',['exec','tsc','-p','tsconfig.json'],{cwd:consumerRoot});
  run(process.execPath,['smoke.mjs'],{cwd:consumerRoot});
} finally { rmSync(consumerRoot,{recursive:true,force:true}); }
console.log(`Validated ${packageNames.length} packed public packages with API Extractor, publint, attw, and an installed tarball consumer.`);
