import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { discoverProductGraph, assertProductGraph } from './discover-product-graph.mjs';

const angularExcludedEntries = new Set(['dist', 'test', 'etc', 'changes']);

function absoluteWithin(root, relativePath, label) {
  const repositoryRoot = path.resolve(root);
  const absolute = path.resolve(repositoryRoot, relativePath);
  if (absolute !== repositoryRoot && !absolute.startsWith(`${repositoryRoot}${path.sep}`)) {
    throw new Error(`${label} escapes repository root: ${relativePath}`);
  }
  return absolute;
}

function packageRelativePath(packageId, projectionPath) {
  const packageRoot = path.posix.normalize(`packages/${packageId}/`);
  const normalized = path.posix.normalize(projectionPath);
  if (!normalized.startsWith(packageRoot)) {
    throw new Error(`Projection path ${projectionPath} does not belong to package ${packageId}`);
  }
  const relative = normalized.slice(packageRoot.length);
  if (!relative || relative.startsWith('../')) {
    throw new Error(`Projection path ${projectionPath} has no package-local destination`);
  }
  return relative;
}

export function packageProjectionPlan(root, packageId, graph = discoverProductGraph(root)) {
  const pkg = graph.packages.find((candidate) => candidate.id === packageId);
  if (!pkg) throw new Error(`Unknown Product Graph package: ${packageId}`);

  const entries = [];
  for (const component of graph.components) {
    for (const surface of Object.values(component.surfaces)) {
      if (surface.package !== packageId || surface.authoringMode !== 'product-unit') continue;
      if (surface.publicEntrypoints.length === 0) continue;
      if (!surface.projectionPath) {
        throw new Error(`${component.id}/${surface.target} has no package projection destination`);
      }
      const sourcePath = surface.authoringPaths[0];
      if (!sourcePath) throw new Error(`${component.id}/${surface.target} has no product-owned authoring path`);
      entries.push({
        component: component.unitId,
        target: surface.target,
        sourcePath,
        projectionPath: surface.projectionPath,
        packageRelativePath: packageRelativePath(packageId, surface.projectionPath),
        publicEntrypoints: [...surface.publicEntrypoints],
      });
    }
  }

  return entries.sort((a, b) => a.projectionPath.localeCompare(b.projectionPath));
}

function copyStandardPackageSource(root, packageId, stageRoot) {
  const sourceRoot = absoluteWithin(root, `packages/${packageId}/src`, 'Package source');
  if (!existsSync(sourceRoot)) throw new Error(`Package ${packageId} has no src directory`);
  cpSync(sourceRoot, path.join(stageRoot, 'src'), { recursive: true });
}

function copyAngularPackageShell(root, stageRoot) {
  const packageRoot = absoluteWithin(root, 'packages/angular', 'Angular package');
  for (const entry of readdirSync(packageRoot, { withFileTypes: true })) {
    if (angularExcludedEntries.has(entry.name)) continue;
    const source = path.join(packageRoot, entry.name);
    const destination = path.join(stageRoot, entry.name);
    cpSync(source, destination, { recursive: entry.isDirectory() });
  }

  const ngPackagePath = path.join(stageRoot, 'ng-package.json');
  const ngPackage = JSON.parse(readFileSync(ngPackagePath, 'utf8'));
  ngPackage.dest = '../../packages/angular/dist';
  writeFileSync(ngPackagePath, `${JSON.stringify(ngPackage, null, 2)}\n`);
}

function overlayProductSources(root, packageId, stageRoot, plan) {
  for (const projection of plan) {
    const source = absoluteWithin(root, projection.sourcePath, 'Product source');
    if (!existsSync(source)) throw new Error(`Product source does not exist: ${projection.sourcePath}`);

    const destination = path.resolve(stageRoot, projection.packageRelativePath);
    const stageBoundary = path.resolve(stageRoot);
    if (!destination.startsWith(`${stageBoundary}${path.sep}`)) {
      throw new Error(`Projection destination escapes stage: ${projection.packageRelativePath}`);
    }

    rmSync(destination, { recursive: true, force: true });
    mkdirSync(path.dirname(destination), { recursive: true });
    cpSync(source, destination, { recursive: true });
  }
}

function writeStandardTsconfig(root, packageId, stageRoot) {
  const extendsPath = path.relative(stageRoot, path.join(root, `packages/${packageId}/tsconfig.json`)).split(path.sep).join('/');
  const outDir = path.relative(stageRoot, path.join(root, `packages/${packageId}/dist`)).split(path.sep).join('/');
  writeFileSync(path.join(stageRoot, 'tsconfig.json'), `${JSON.stringify({
    extends: extendsPath.startsWith('.') ? extendsPath : `./${extendsPath}`,
    compilerOptions: {
      rootDir: './src',
      outDir,
    },
    include: ['src/**/*.ts'],
  }, null, 2)}\n`);
}

export function preparePackageProjection({ root, packageId, graph = null } = {}) {
  if (!root || !packageId) throw new Error('preparePackageProjection requires root and packageId');
  const resolvedGraph = graph ?? assertProductGraph(root);
  const stageRoot = absoluteWithin(root, `.vf-projection/${packageId}`, 'Projection stage');
  rmSync(stageRoot, { recursive: true, force: true });
  mkdirSync(stageRoot, { recursive: true });

  if (packageId === 'angular') copyAngularPackageShell(root, stageRoot);
  else copyStandardPackageSource(root, packageId, stageRoot);

  const plan = packageProjectionPlan(root, packageId, resolvedGraph);
  overlayProductSources(root, packageId, stageRoot, plan);

  if (packageId !== 'angular') writeStandardTsconfig(root, packageId, stageRoot);

  return {
    packageId,
    stageRoot,
    sourceRoot: packageId === 'angular' ? null : path.join(stageRoot, 'src'),
    plan,
  };
}

export function cleanupPackageProjection(root, packageId) {
  rmSync(absoluteWithin(root, `.vf-projection/${packageId}`, 'Projection stage'), { recursive: true, force: true });
}
