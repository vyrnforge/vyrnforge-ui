import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const angularRoot = path.join(root, 'packages/angular');
const phase = process.argv[2] ?? 'prepare';
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

if (phase === 'prepare') {
  const packagePath = path.join(angularRoot, 'package.json');
  const manifest = readJson(packagePath);
  const entrypoints = Object.keys(manifest.exports ?? {})
    .filter((key) => key.startsWith('./') && !key.includes('*'))
    .map((key) => key.slice(2));

  let primary = readFileSync(path.join(angularRoot, 'src/index.ts'), 'utf8');
  for (const name of entrypoints) {
    const sourceDirectory = path.join(angularRoot, 'src/components', name);
    const sourceEntry = path.join(sourceDirectory, 'index.ts');
    try { readFileSync(sourceEntry); } catch { continue; }

    const secondaryRoot = path.join(angularRoot, name);
    mkdirSync(secondaryRoot, { recursive: true });
    renameSync(sourceDirectory, path.join(secondaryRoot, 'src'));
    writeJson(path.join(secondaryRoot, 'ng-package.json'), {
      $schema: '../../../node_modules/ng-packagr/ng-entrypoint.schema.json',
      lib: { entryFile: 'src/index.ts' },
    });
    primary = primary.replaceAll(`./components/${name}/index.js`, `@vyrnforge/angular/${name}`);
  }
  writeFileSync(path.join(angularRoot, 'src/index.ts'), primary);
  rmSync(path.join(angularRoot, 'src/components'), { recursive: true, force: true });

  const secondaryRoots = entrypoints
    .map((name) => path.join(angularRoot, name, 'src'))
    .filter((directory) => {
      try { return readdirSync(directory).length >= 0; } catch { return false; }
    });
  const stack = [...secondaryRoots];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (/\.ts$/.test(entry.name)) {
        const source = readFileSync(absolute, 'utf8');
        const rewritten = source.replace(
          /(['"])\.\.\/([a-z0-9-]+)\/index\.js\1/g,
          (_match, quote, dependency) => `${quote}@vyrnforge/angular/${dependency}${quote}`,
        );
        if (rewritten !== source) writeFileSync(absolute, rewritten);
      }
    }
  }

  writeJson(path.join(angularRoot, 'ng-package.json'), {
    $schema: '../../node_modules/ng-packagr/ng-package.schema.json',
    dest: 'dist',
    allowedNonPeerDependencies: ['@vyrnforge/core', '@vyrnforge/web', 'tslib'],
    lib: { entryFile: 'src/index.ts' },
  });
  writeJson(path.join(angularRoot, 'tsconfig.lib.json'), {
    extends: '../../node_modules/ng-packagr/src/lib/ts/conf/tsconfig.ngc.json',
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      strict: true,
      declarationMap: true,
      sourceMap: true,
      exactOptionalPropertyTypes: true,
      noUncheckedIndexedAccess: true,
      useUnknownInCatchVariables: true,
      forceConsistentCasingInFileNames: true,
      skipLibCheck: true,
    },
    angularCompilerOptions: { compilationMode: 'partial', strictTemplates: true },
  });
  writeJson(path.join(angularRoot, 'tsconfig.json'), {
    extends: '../../tsconfig.base.json',
    compilerOptions: { rootDir: '.', outDir: 'dist/typecheck' },
    angularCompilerOptions: { compilationMode: 'partial', strictTemplates: true },
    include: ['src/**/*.ts', '*/src/**/*.ts'],
  });

  manifest.dependencies = { ...manifest.dependencies, tslib: '^2.8.1' };
  manifest.scripts = { ...manifest.scripts, build: 'ng-packagr -p ng-package.json --config tsconfig.lib.json' };
  writeJson(packagePath, manifest);

  const projectPath = path.join(angularRoot, 'project.json');
  const project = readJson(projectPath);
  project.sourceRoot = 'packages/angular';
  project.targets.lint.options.command = 'pnpm exec eslint packages/angular --max-warnings=0';
  project.targets.typecheck.dependsOn = ['build'];
  writeJson(projectPath, project);

  console.log(`Prepared ${secondaryRoots.length} Angular secondary entrypoints for APF.`);
} else if (phase === 'finalize') {
  const packagePath = path.join(angularRoot, 'package.json');
  const sourceManifest = readJson(packagePath);
  const apfManifest = readJson(path.join(angularRoot, 'dist/package.json'));

  const prefixDist = (value) => {
    if (typeof value === 'string') return value.startsWith('./') ? `./dist/${value.slice(2)}` : value;
    if (Array.isArray(value)) return value.map(prefixDist);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, prefixDist(item)]));
    return value;
  };

  sourceManifest.main = prefixDist(apfManifest.main ?? apfManifest.module);
  sourceManifest.module = prefixDist(apfManifest.module ?? apfManifest.main);
  sourceManifest.types = prefixDist(apfManifest.types ?? './types/vyrnforge-angular.d.ts');
  sourceManifest.exports = prefixDist(apfManifest.exports);
  sourceManifest.files = ['dist'];
  writeJson(packagePath, sourceManifest);

  rmSync(path.join(root, '.github/workflows/apply-angular-apf-migration.yml'), { force: true });
  rmSync(path.join(root, 'tooling/verify/apply-angular-apf-migration.mjs'), { force: true });
  console.log('Synchronized source package metadata with ng-packagr APF output and removed migration machinery.');
} else {
  throw new Error(`Unknown phase: ${phase}`);
}
