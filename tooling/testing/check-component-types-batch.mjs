import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { discoverProductUnits } from './discover-product-units.mjs';

const discovery = discoverProductUnits();
const sources = [];
for (const component of discovery.components) {
  if (component.conformanceTypes) sources.push(component.conformanceTypes);
  for (const config of Object.values(component.ports)) if (config.types) sources.push(config.types);
}

if (!sources.length) throw new Error('No discovered component type evidence to validate');

const outputDir = path.resolve('test-results/types');
mkdirSync(outputDir, { recursive: true });
const configPath = path.join(outputDir, 'all-components.tsconfig.json');
const baseConfig = path.relative(outputDir, path.resolve('tsconfig.base.json')).replaceAll('\\', '/');
const include = [...new Set(sources)].sort().map((source) => path.relative(outputDir, path.resolve(source)).replaceAll('\\', '/'));
writeFileSync(configPath, `${JSON.stringify({
  extends: baseConfig,
  compilerOptions: { noEmit: true, declaration: false, declarationMap: false, sourceMap: false },
  include
}, null, 2)}\n`);

process.stdout.write(`component type batch: ${include.length} evidence files\n`);
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', configPath], { stdio: 'inherit' });
