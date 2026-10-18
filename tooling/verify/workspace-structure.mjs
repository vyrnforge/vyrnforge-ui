import { existsSync, readFileSync } from 'node:fs';

const expected = new Map([
  ['core', '@vyrnforge/core'],
  ['web', '@vyrnforge/web'],
  ['react', '@vyrnforge/react'],
  ['angular', '@vyrnforge/angular'],
  ['vue', '@vyrnforge/vue'],
  ['elements', '@vyrnforge/elements'],
  ['legacy', '@vyrnforge/legacy']
]);
const forbiddenLegacyDirs = [
  'packages/ui-core',
  'packages/ui-behaviors',
  'packages/ui-components',
  'packages/ui-elements',
  'packages/ui-angular',
  'packages/ui-vue',
  'packages/ui-data-grid',
  'apps',
  'scripts',
  'tests'
];

for (const [directory, packageName] of expected) {
  const manifestPath = `packages/${directory}/package.json`;
  if (!existsSync(manifestPath)) throw new Error(`Missing ${manifestPath}`);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.name !== packageName) throw new Error(`${manifestPath} must be named ${packageName}`);
}

for (const directory of forbiddenLegacyDirs) {
  if (existsSync(directory)) throw new Error(`Legacy path must remain quarantined: ${directory}`);
}

const root = JSON.parse(readFileSync('package.json', 'utf8'));
if (JSON.stringify(root.workspaces) !== JSON.stringify(['packages/*'])) {
  throw new Error('Root workspaces must remain exactly ["packages/*"] during bootstrap.');
}

console.log('workspace structure: ok');
