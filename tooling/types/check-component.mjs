import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [componentId] = process.argv.slice(2);
if (!componentId) throw new Error('Usage: node tooling/types/check-component.mjs <component>');

const registry = JSON.parse(readFileSync(new URL('../../testing/components/registry.json', import.meta.url), 'utf8'));
const component = registry.components.find((entry) => entry.component === componentId);
if (!component) throw new Error(`Unknown component: ${componentId}`);
if (!component.types) throw new Error(`No type contract registered for ${componentId}`);

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
