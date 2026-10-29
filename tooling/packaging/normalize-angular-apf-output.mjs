import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packageRoot = path.join(root, 'packages/angular');
const distRoot = path.join(packageRoot, 'dist');
const manifest = JSON.parse(readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));

if (!existsSync(distRoot)) throw new Error('@vyrnforge/angular APF output is missing');

for (const [specifier, target] of Object.entries(manifest.exports ?? {})) {
  const values = typeof target === 'string' ? [target] : Object.values(target ?? {}).filter((value) => typeof value === 'string');
  if (values.length === 0) throw new Error(`@vyrnforge/angular export ${specifier} has no artifact target`);
  for (const value of values) {
    if (!value.startsWith('./dist/')) continue;
    const absolute = path.join(packageRoot, value.slice(2));
    if (!existsSync(absolute)) throw new Error(`@vyrnforge/angular export ${specifier} targets missing artifact ${value}`);
  }
}

const stack = [distRoot];
let removed = 0;
while (stack.length) {
  const directory = stack.pop();
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) stack.push(absolute);
    else if (entry.name === 'package.json') {
      rmSync(absolute);
      removed += 1;
    }
  }
}

console.log(`Normalized Angular APF output; removed ${removed} nested package manifest${removed === 1 ? '' : 's'}.`);
