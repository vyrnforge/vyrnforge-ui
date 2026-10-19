import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const [componentId, port, mode = 'chromium'] = process.argv.slice(2);
if (!componentId || !port) throw new Error('Usage: node tooling/browser/run-component.mjs <component> <port> [chromium|firefox|webkit|all]');
if (!['chromium', 'firefox', 'webkit', 'all'].includes(mode)) throw new Error(`Unknown browser mode: ${mode}`);

const registry = JSON.parse(readFileSync(new URL('../../testing/components/registry.json', import.meta.url), 'utf8'));
const component = registry.components.find((entry) => entry.component === componentId);
if (!component) throw new Error(`Unknown component: ${componentId}`);
const portConfig = component.ports?.[port];
if (!portConfig?.browser) throw new Error(`No browser evidence registered for ${componentId}/${port}`);
const runner = component.browser?.runner;
if (!runner) throw new Error(`No browser runner registered for ${componentId}`);

execFileSync(process.execPath, [runner, port, mode], { stdio: 'inherit' });
