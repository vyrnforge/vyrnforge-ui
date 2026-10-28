import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const productRoot = path.join(root, 'product');
let changed = 0;

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(target));
    else if (entry.name.endsWith('.spec.mjs')) files.push(target);
  }
  return files;
}

if (existsSync(productRoot)) {
  for (const file of walk(productRoot)) {
    let source = readFileSync(file, 'utf8');
    const before = source;
    source = source.replace("import axeCore from 'axe-core';", "import AxeBuilder from '@axe-core/playwright';");
    source = source.replaceAll("    await page.addScriptTag({ content: axeCore.source });\n", '');
    source = source.replaceAll(
      'const results = await page.evaluate(async () => globalThis.axe.run(document));',
      'const results = await new AxeBuilder({ page }).analyze();',
    );
    source = source.replace(
      /const results = await page\.evaluate\(async \(selector\) => globalThis\.axe\.run\(document\.querySelector\(selector\)\), ([^;]+)\);/g,
      'const results = await new AxeBuilder({ page }).include($1).analyze();',
    );
    source = source.replace(
      /const results = await page\.evaluate\(async \(\) => globalThis\.axe\.run\(document\.querySelector\(([^)]+)\)\)\);/g,
      'const results = await new AxeBuilder({ page }).include($1).analyze();',
    );
    if (source !== before) {
      writeFileSync(file, source);
      changed += 1;
    }
  }
}

console.log(`Migrated ${changed} Playwright specs to @axe-core/playwright.`);
