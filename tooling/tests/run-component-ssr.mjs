import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const [componentId, port] = process.argv.slice(2);
if (!componentId || !port) throw new Error('Usage: node tooling/tests/run-component-ssr.mjs <component> <port>');

const registry = JSON.parse(readFileSync(new URL('../../testing/components/registry.json', import.meta.url), 'utf8'));
const component = registry.components.find((entry) => entry.component === componentId);
if (!component) throw new Error(`Unknown component: ${componentId}`);
const testFile = component.ports?.[port]?.ssr;
if (!testFile) throw new Error(`No SSR evidence registered for ${componentId}/${port}`);

execFileSync(process.execPath, ['--test', testFile], { stdio: 'inherit' });
