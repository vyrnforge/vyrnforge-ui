import { test } from 'vitest';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cleanupPackageProjection, packageProjectionPlan, preparePackageProjection } from './package-projection.mjs';

function writer(root) {
  return (relativePath, content = '') => {
    const target = path.join(root, relativePath);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  };
}

function graphFor(packageId, surfaces) {
  return {
    packages: [{ id: packageId, name: `@vyrnforge/${packageId}`, manifest: {} }],
    components: surfaces.map(({ component, target, sourcePath, projectionPath, publicEntrypoints = [`@vyrnforge/${packageId}/${component}`] }) => ({
      id: `component:${component}`,
      unitId: component,
      surfaces: {
        [target]: {
          package: packageId,
          target,
          authoringMode: 'product-unit',
          authoringPaths: [sourcePath],
          projectionPath,
          publicEntrypoints,
        },
      },
    })),
  };
}

test('standard package projection overlays product-owned source onto the package build shape', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-package-projection-'));
  const write = writer(root);

  write('packages/react/package.json', JSON.stringify({ name: '@vyrnforge/react', type: 'module' }));
  write('packages/react/src/index.ts', "export * from './components/button/index.js';\n");
  write('packages/react/src/components/button/index.ts', 'export const Button = "legacy";\n');
  write('packages/react/src/components/checkbox/index.ts', 'export const Checkbox = true;\n');
  write('packages/react/tsconfig.json', JSON.stringify({ compilerOptions: { rootDir: 'src', outDir: 'dist' }, include: ['src/**/*.ts'] }));
  write('product/components/button/react/index.ts', 'export const Button = "product";\n');

  const graph = graphFor('react', [{
    component: 'button',
    target: 'react',
    sourcePath: 'product/components/button/react/',
    projectionPath: 'packages/react/src/components/button/',
  }]);

  const result = preparePackageProjection({ root, packageId: 'react', graph });
  assert.equal(readFileSync(path.join(result.stageRoot, 'src/components/button/index.ts'), 'utf8'), 'export const Button = "product";\n');
  assert.equal(readFileSync(path.join(result.stageRoot, 'src/components/checkbox/index.ts'), 'utf8'), 'export const Checkbox = true;\n');
  assert.deepEqual(JSON.parse(readFileSync(path.join(result.stageRoot, 'package.json'), 'utf8')), {
    name: '@vyrnforge/react',
    type: 'module',
  });
  const projectedTsconfig = JSON.parse(readFileSync(path.join(result.stageRoot, 'tsconfig.json'), 'utf8'));
  assert.equal(projectedTsconfig.compilerOptions.rootDir, './src');
  assert.ok(projectedTsconfig.compilerOptions.outDir.endsWith('packages/react/dist'));
  cleanupPackageProjection(root, 'react');
  assert.equal(existsSync(result.stageRoot), false);
});

test('foundation-owned Web styles project to the stable distribution path', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-foundation-projection-'));
  const write = writer(root);
  write('packages/web/package.json', JSON.stringify({ name: '@vyrnforge/web', type: 'module' }));
  write('packages/web/src/index.ts', 'export {};\n');
  write('packages/web/tsconfig.json', '{}\n');
  write('product/foundations/elemental-primitives/web/elemental-primitives.css', '[data-vf-mark] {}\n');

  const graph = {
    packages: [{ id: 'web', name: '@vyrnforge/web', manifest: {} }],
    units: [{
      id: 'foundation:elemental-primitives',
      unitId: 'elemental-primitives',
      kind: 'foundation',
      surfaces: {
        web: {
          package: 'web',
          target: 'web',
          authoringMode: 'product-unit',
          authoringPaths: ['product/foundations/elemental-primitives/web/'],
          projectionPath: 'packages/web/src/foundations/elemental-primitives/',
          publicEntrypoints: ['@vyrnforge/web/styles/elemental-primitives.css'],
        },
      },
    }],
  };

  const plan = packageProjectionPlan(root, 'web', graph);
  assert.equal(plan.length, 1);
  assert.equal(plan[0].sourcePath, 'product/foundations/elemental-primitives/web/');
  assert.equal(plan[0].packageRelativePath, 'src/foundations/elemental-primitives/');

  const result = preparePackageProjection({ root, packageId: 'web', graph });
  assert.equal(
    readFileSync(path.join(result.stageRoot, 'src/foundations/elemental-primitives/elemental-primitives.css'), 'utf8'),
    '[data-vf-mark] {}\n',
  );
  cleanupPackageProjection(root, 'web');
});

test('unprojected product drafts are excluded from distributable package projection', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-package-projection-draft-'));
  const write = writer(root);
  write('packages/react/package.json', JSON.stringify({ name: '@vyrnforge/react', type: 'module' }));
  write('packages/react/src/index.ts', 'export {};\n');
  write('packages/react/tsconfig.json', '{}\n');
  write('product/components/draft/react/index.ts', 'export const Draft = true;\n');

  const graph = graphFor('react', [{
    component: 'draft',
    target: 'react',
    sourcePath: 'product/components/draft/react/',
    projectionPath: 'packages/react/src/components/draft/',
    publicEntrypoints: [],
  }]);

  assert.deepEqual(packageProjectionPlan(root, 'react', graph), []);
  const result = preparePackageProjection({ root, packageId: 'react', graph });
  assert.equal(existsSync(path.join(result.stageRoot, 'src/components/draft')), false);
});

test('Angular projection preserves secondary-entrypoint shape while overlaying product source', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-package-projection-angular-'));
  const write = writer(root);

  write('packages/angular/package.json', JSON.stringify({ name: '@vyrnforge/angular' }));
  write('packages/angular/ng-package.json', JSON.stringify({ dest: 'dist', lib: { entryFile: 'src/index.ts' } }));
  write('packages/angular/tsconfig.lib.json', '{}\n');
  write('packages/angular/src/index.ts', "export * from '@vyrnforge/angular/button';\n");
  write('packages/angular/button/ng-package.json', JSON.stringify({ lib: { entryFile: 'src/index.ts' } }));
  write('packages/angular/button/src/index.ts', 'export const Button = "legacy";\n');
  write('product/components/button/angular/index.ts', 'export const Button = "product";\n');

  const graph = graphFor('angular', [{
    component: 'button',
    target: 'angular',
    sourcePath: 'product/components/button/angular/',
    projectionPath: 'packages/angular/button/src/',
  }]);

  const result = preparePackageProjection({ root, packageId: 'angular', graph });
  assert.equal(readFileSync(path.join(result.stageRoot, 'button/src/index.ts'), 'utf8'), 'export const Button = "product";\n');
  assert.ok(existsSync(path.join(result.stageRoot, 'button/ng-package.json')));
  const rootNgPackage = JSON.parse(readFileSync(path.join(result.stageRoot, 'ng-package.json'), 'utf8'));
  assert.equal(rootNgPackage.dest, '../../packages/angular/dist');
});

test('projection refuses destinations outside the selected package', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-package-projection-invalid-'));
  const graph = graphFor('react', [{
    component: 'button',
    target: 'react',
    sourcePath: 'product/components/button/react/',
    projectionPath: 'packages/vue/src/components/button/',
  }]);

  assert.throws(() => packageProjectionPlan(root, 'react', graph), /does not belong to package react/);
});


test('named package projection stages isolate parallel build and typecheck work', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-package-projection-parallel-'));
  const write = writer(root);
  write('packages/react/package.json', JSON.stringify({ name: '@vyrnforge/react', type: 'module' }));
  write('packages/react/src/index.ts', 'export {};\n');
  write('packages/react/tsconfig.json', '{}\n');
  const graph = graphFor('react', []);

  const build = preparePackageProjection({ root, packageId: 'react', graph, stageId: 'build' });
  const typecheck = preparePackageProjection({ root, packageId: 'react', graph, stageId: 'typecheck' });
  assert.notEqual(build.stageRoot, typecheck.stageRoot);
  assert.ok(existsSync(build.stageRoot));
  assert.ok(existsSync(typecheck.stageRoot));

  cleanupPackageProjection(root, 'react', 'build');
  assert.equal(existsSync(build.stageRoot), false);
  assert.ok(existsSync(typecheck.stageRoot));
  cleanupPackageProjection(root, 'react', 'typecheck');
  assert.equal(existsSync(typecheck.stageRoot), false);
});
