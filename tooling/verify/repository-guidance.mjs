import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ignoredRoots = new Set(['.git', 'dist', 'node_modules', 'test-results']);
const ignoredFiles = new Set(['tooling/verify/repository-guidance.mjs']);
const textExtensions = new Set(['.md', '.json', '.yml', '.yaml', '.js', '.mjs', '.ts', '.tsx', '.css', '.html']);
const legacyTokens = [
  '@vyrnforge/' + 'ui-core',
  '@vyrnforge/' + 'ui-behaviors',
  '@vyrnforge/' + 'ui-components',
  '@vyrnforge/' + 'ui-elements',
  '@vyrnforge/' + 'ui-angular',
  '@vyrnforge/' + 'ui-vue',
  '@vyrnforge/' + 'ui-data-grid',
  '@vyrnforge/' + 'ui-docs',
  '@vyrnforge/' + 'ui-regression-fixtures',
  'docs/' + 'governance/'
];

async function walk(directory = '.') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (directory === '.' && ignoredRoots.has(entry.name)) continue;
    const full = path.posix.normalize(path.join(directory, entry.name).replaceAll('\\', '/')).replace(/^\.\//, '');
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (textExtensions.has(path.extname(entry.name)) && !ignoredFiles.has(full)) files.push(full);
  }
  return files;
}

const violations = [];
for (const file of await walk()) {
  const source = await readFile(file, 'utf8');
  for (const token of legacyTokens) {
    if (source.includes(token)) violations.push(`${file}: stale legacy reference ${token}`);
  }
}

if (violations.length) throw new Error(`Active repository guidance references retired architecture:\n${violations.join('\n')}`);
process.stdout.write('repository guidance: no active retired architecture references\n');
