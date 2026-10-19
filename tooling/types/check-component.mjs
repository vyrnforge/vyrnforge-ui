import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { discoverComponents } from '../testing/discover-components.mjs';

const [componentId] = process.argv.slice(2);
if (!componentId) throw new Error('Usage: node tooling/types/check-component.mjs <component>');

const component = discoverComponents().components.find((entry) => entry.component === componentId);
if (!component) throw new Error(`Unknown discovered component: ${componentId}`);
if (!component.types) throw new Error(`No conventional type contract expected for ${componentId}`);

const outputDir = path.resolve('test-results/types');
mkdirSync(outputDir, { recursive: true });
const configPath = path.join(outputDir, `${componentId}.tsconfig.json`);
const sourcePath = path.relative(outputDir, path.resolve(component.types)).replaceAll('\\', '/');
const baseConfig = path.relative(outputDir, path.resolve('tsconfig.base.json')).replaceAll('\\', '/');
writeFileSync(configPath, `${JSON.stringify({
  extends: baseConfig,
  compilerOptions: {
    noEmit: true,
    declaration: false,
    declarationMap: false,
    sourceMap: false
  },
  include: [sourcePath]
}, null, 2)}\n`);

execFileSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', configPath], { stdio: 'inherit' });
