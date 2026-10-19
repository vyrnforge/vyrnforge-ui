import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { discoverProductUnits } from './discover-product-units.mjs';

const [componentId, owner = 'conformance'] = process.argv.slice(2);
if (!componentId) throw new Error('Usage: node tooling/testing/check-component-types.mjs <component> [port|conformance]');

const component = discoverProductUnits().components.find((entry) => entry.component === componentId);
if (!component) throw new Error(`Unknown discovered component: ${componentId}`);
const source = owner === 'conformance' ? component.conformanceTypes : component.ports?.[owner]?.types;
if (!source) throw new Error(`No conventional type evidence for ${componentId}/${owner}`);

const outputDir = path.resolve('test-results/types');
mkdirSync(outputDir, { recursive: true });
const configPath = path.join(outputDir, `${componentId}-${owner}.tsconfig.json`);
const sourcePath = path.relative(outputDir, path.resolve(source)).replaceAll('\\', '/');
const baseConfig = path.relative(outputDir, path.resolve('tsconfig.base.json')).replaceAll('\\', '/');
writeFileSync(configPath, `${JSON.stringify({
  extends: baseConfig,
  compilerOptions: { noEmit: true, declaration: false, declarationMap: false, sourceMap: false },
  include: [sourcePath]
}, null, 2)}\n`);
execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', configPath], { stdio: 'inherit' });
