import { access, readFile } from 'node:fs/promises';

const packages = ['core', 'web', 'react', 'angular', 'vue', 'elements'];
const allowedDependencies = {
  core: [],
  web: ['@vyrnforge/core'],
  react: ['@vyrnforge/core', '@vyrnforge/web'],
  angular: ['@vyrnforge/core', '@vyrnforge/web'],
  vue: ['@vyrnforge/core', '@vyrnforge/web'],
  elements: ['@vyrnforge/core', '@vyrnforge/web']
};

function flattenExportTargets(value, targets = []) {
  if (typeof value === 'string') targets.push(value);
  else if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) flattenExportTargets(nested, targets);
  }
  return targets;
}

for (const name of packages) {
  const manifest = JSON.parse(await readFile(new URL(`../../packages/${name}/package.json`, import.meta.url), 'utf8'));
  if (manifest.private !== true) throw new Error(`${manifest.name} must remain private during rebuild bootstrap`);
  if (manifest.type !== 'module') throw new Error(`${manifest.name} must be ESM`);
  if (JSON.stringify(manifest.files) !== JSON.stringify(['dist'])) {
    throw new Error(`${manifest.name} must publish only dist during bootstrap`);
  }
  if (manifest.main !== './dist/index.js' || manifest.types !== './dist/index.d.ts') {
    throw new Error(`${manifest.name} main/types must resolve to dist`);
  }
  const targets = flattenExportTargets(manifest.exports);
  if (targets.length === 0 || targets.some((target) => !target.startsWith('./dist/'))) {
    throw new Error(`${manifest.name} exports must expose only built dist artifacts`);
  }
  if (targets.some((target) => target.includes('/src/') || target.includes('/internal/'))) {
    throw new Error(`${manifest.name} exposes an internal source path`);
  }
  const declared = Object.keys(manifest.dependencies ?? {}).filter((dependency) => dependency.startsWith('@vyrnforge/')).sort();
  const expected = [...allowedDependencies[name]].sort();
  if (JSON.stringify(declared) !== JSON.stringify(expected)) {
    throw new Error(`${manifest.name} internal dependencies must be ${expected.join(', ') || '<none>'}`);
  }
  await access(new URL(`../../packages/${name}/tsconfig.json`, import.meta.url));
}

const web = JSON.parse(await readFile(new URL('../../packages/web/package.json', import.meta.url), 'utf8'));
if (JSON.stringify(web.sideEffects) !== JSON.stringify(['./dist/styles.css'])) {
  throw new Error('@vyrnforge/web must isolate its CSS side effect to ./dist/styles.css');
}
if (web.exports?.['./styles.css'] !== './dist/styles.css') {
  throw new Error('@vyrnforge/web must expose the canonical stylesheet explicitly');
}

process.stdout.write('package contracts: ok\n');
