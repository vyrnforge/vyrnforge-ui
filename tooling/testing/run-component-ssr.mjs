import { execFileSync } from 'node:child_process';
import { discoverProductUnits } from './discover-product-units.mjs';

const [componentId, port] = process.argv.slice(2);
if (!componentId || !port) throw new Error('Usage: node tooling/testing/run-component-ssr.mjs <component> <port>');

const component = discoverProductUnits().components.find((entry) => entry.component === componentId);
if (!component) throw new Error(`Unknown discovered component: ${componentId}`);
const testFile = component.ports?.[port]?.ssr;
if (!testFile) throw new Error(`No conventional SSR evidence for ${componentId}/${port}`);

execFileSync(process.execPath, ['--test', testFile], { stdio: 'inherit' });
