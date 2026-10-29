import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const roots = ['packages', 'product', 'tooling', 'apps/docs'];

function walk(relativeRoot) {
  const absoluteRoot = path.join(root, relativeRoot);
  if (!existsSync(absoluteRoot)) return [];
  const files = [];
  const stack = [absoluteRoot];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else files.push(absolute);
    }
  }
  return files;
}

let changed = 0;
for (const absolute of roots.flatMap(walk)) {
  if (!/\.(?:mjs|cjs|js|mts|cts|ts|tsx)$/.test(absolute)) continue;
  let source = readFileSync(absolute, 'utf8');
  const before = source;

  source = source.replace(
    /import\s+test\s+from\s*(['"])node:test\1\s*;?/g,
    "import { test } from 'vitest';",
  );
  source = source.replace(
    /from\s*(['"])node:test\1/g,
    "from 'vitest'",
  );

  if (source !== before) {
    writeFileSync(absolute, source);
    changed += 1;
  }
}

const packageJsonPath = path.join(root, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
packageJson.scripts['test:unit'] = 'nx run-many -t test';
writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

for (const temporaryPath of [
  '.github/workflows/finish-vitest-migration.yml',
  'tooling/verify/finish-vitest-migration.mjs',
]) {
  rmSync(path.join(root, temporaryPath), { force: true });
}

console.log(`Finished Vitest migration across ${changed} source files.`);
