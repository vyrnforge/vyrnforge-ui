import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function collectSpecs(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectSpecs(target));
    else if (entry.isFile() && /\.spec\.mjs$/.test(entry.name) && target.includes(`${path.sep}test${path.sep}browser${path.sep}tests${path.sep}`)) files.push(target);
  }
  return files;
}

const files = await collectSpecs('product');
const migrated = [];
const unresolved = [];
const sharedImport = "import { expectNoAxeViolations } from '../../../../../tooling/testing/accessibility.mjs';";

for (const file of files) {
  let source = await readFile(file, 'utf8');
  if (!/axeCore\.source|globalThis\.axe(?:\.|\b)/.test(source)) continue;
  const original = source;

  source = source
    .replace(/import\s+axeCore\s+from\s*['"]axe-core['"];?/g, '')
    .replace(/await\s+page\.addScriptTag\(\{\s*content\s*:\s*axeCore\.source\s*\}\);?/g, '');

  source = source.replace(
    /await\s+page\.evaluate\(\s*async\s*\(\)\s*=>\s*globalThis\.axe\.run\(document\)\s*\)/g,
    'await expectNoAxeViolations(page)',
  );

  source = source.replace(
    /await\s+page\.evaluate\(\s*async\s*\(\)\s*=>\s*globalThis\.axe\.run\(document\s*,\s*\{\s*rules\s*:\s*\{\s*region\s*:\s*\{\s*enabled\s*:\s*false\s*\}\s*,?\s*\}\s*,?\s*\}\)\s*\)/g,
    "await expectNoAxeViolations(page, { disableRules: ['region'] })",
  );

  if (source !== original && source.includes('expectNoAxeViolations') && !source.includes("tooling/testing/accessibility.mjs")) {
    const playwrightImport = /import\s*\{\s*test\s*,\s*expect\s*\}\s*from\s*['"]@playwright\/test['"];?/;
    const match = source.match(playwrightImport);
    if (match) source = source.replace(match[0], `${match[0]}\n${sharedImport}`);
  }

  if (source.includes("@axe-core/playwright") && !source.includes('new AxeBuilder')) {
    source = source.replace(/import\s+AxeBuilder\s+from\s*['"]@axe-core\/playwright['"];?\s*/g, '');
  }

  if (/axeCore\.source|globalThis\.axe(?:\.|\b)|import\s+axeCore\s+from\s*['"]axe-core['"]/.test(source)) {
    unresolved.push(file.split(path.sep).join('/'));
    continue;
  }

  if (source !== original) {
    await writeFile(file, source);
    migrated.push(file.split(path.sep).join('/'));
  }
}

process.stdout.write(`migrated ${migrated.length} browser specs\n`);
for (const file of migrated) process.stdout.write(`migrated: ${file}\n`);
if (unresolved.length) {
  process.stderr.write(`unresolved legacy axe patterns:\n${unresolved.map((file) => `- ${file}`).join('\n')}\n`);
  process.exitCode = 2;
}
