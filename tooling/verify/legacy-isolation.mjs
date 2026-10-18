import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const legacyRoot = 'packages/legacy/archive';
if (!existsSync(legacyRoot)) throw new Error('Legacy archive is missing.');

const expectedArchive = ['ai', 'apps', 'docs', 'github', 'packages', 'root', 'scripts', 'tests'];
for (const name of expectedArchive) {
  if (!existsSync(join(legacyRoot, name))) throw new Error(`Legacy archive is missing ${name}`);
}

function filesUnder(directory) {
  const result = [];
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) result.push(...filesUnder(path));
    else result.push(path);
  }
  return result;
}

for (const packageDirectory of ['core', 'web', 'react', 'angular', 'vue', 'elements']) {
  for (const file of filesUnder(`packages/${packageDirectory}`)) {
    if (!/\.(?:ts|js|mjs|cjs|json|css)$/.test(file)) continue;
    const content = readFileSync(file, 'utf8');
    if (content.includes('@vyrnforge/legacy') || content.includes('packages/legacy')) {
      throw new Error(`New package references legacy archive: ${file}`);
    }
  }
}

const legacyManifest = JSON.parse(readFileSync('packages/legacy/package.json', 'utf8'));
if (legacyManifest.private !== true) throw new Error('@vyrnforge/legacy must remain private.');

console.log('legacy isolation: ok');
