import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { discoverProductUnits } from './discover-product-units.mjs';

const [packageName, kind, id] = process.argv.slice(2);
if (!packageName || !kind || !id) throw new Error('Usage: node tooling/testing/run-owned-unit.mjs <package> <kind> <id>');
const unit = discoverProductUnits().ownedUnits.find((entry) => entry.package === packageName && entry.kind === kind && entry.id === id);
if (!unit) throw new Error(`Unknown scoped product unit: ${packageName}/${kind}/${id}`);
const runtimeTests = unit.evidenceFiles.filter((file) => /\.test\.(?:mjs|js|cjs)$/.test(file));
const typeTests = unit.evidenceFiles.filter((file) => /\.types\.ts$/.test(file));
if (runtimeTests.length) execFileSync(process.execPath, ['--test', ...runtimeTests], { stdio: 'inherit' });
if (typeTests.length) {
  const outputDir = path.resolve('test-results/types');
  mkdirSync(outputDir, { recursive: true });
  const configPath = path.join(outputDir, `${packageName}-${kind}-${id}.tsconfig.json`);
  const include = typeTests.map((file) => path.relative(outputDir, path.resolve(file)).replaceAll('\\', '/'));
  const baseConfig = path.relative(outputDir, path.resolve('tsconfig.base.json')).replaceAll('\\', '/');
  writeFileSync(configPath, `${JSON.stringify({ extends: baseConfig, compilerOptions: { noEmit: true, declaration: false, declarationMap: false, sourceMap: false }, include }, null, 2)}\n`);
  execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', configPath], { stdio: 'inherit' });
}
