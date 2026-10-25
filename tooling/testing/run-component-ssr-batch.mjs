import { execFileSync } from 'node:child_process';
import { discoverProductUnits } from './discover-product-units.mjs';

const discovery = discoverProductUnits();
const testFiles = [];
for (const component of discovery.components) {
  for (const config of Object.values(component.ports)) if (config.ssr) testFiles.push(config.ssr);
}

const uniqueTests = [...new Set(testFiles)].sort();
if (!uniqueTests.length) throw new Error('No discovered component SSR evidence to validate');

process.stdout.write(`component SSR batch: ${uniqueTests.length} evidence files\n`);
execFileSync(process.execPath, ['--import', '@angular/compiler', '--test', ...uniqueTests], { stdio: 'inherit' });
