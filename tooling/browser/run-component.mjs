import { execFileSync } from 'node:child_process';
import { discoverComponents } from '../testing/discover-components.mjs';

const [componentId, port, mode = 'chromium'] = process.argv.slice(2);
if (!componentId || !port) throw new Error('Usage: node tooling/browser/run-component.mjs <component> <port> [chromium|firefox|webkit|all]');
if (!['chromium', 'firefox', 'webkit', 'all'].includes(mode)) throw new Error(`Unknown browser mode: ${mode}`);

const component = discoverComponents().components.find((entry) => entry.component === componentId);
if (!component) throw new Error(`Unknown discovered component: ${componentId}`);
const portConfig = component.ports?.[port];
if (!portConfig?.browser) throw new Error(`No browser evidence expected for ${componentId}/${port}`);
const runner = component.browser?.runner;
if (!runner) throw new Error(`No conventional browser runner for ${componentId}`);

execFileSync(process.execPath, [runner, port, mode], { stdio: 'inherit' });
