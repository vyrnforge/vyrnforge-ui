import { execFileSync } from 'node:child_process';
import { discoverProductUnits } from '../testing/discover-product-units.mjs';

const [componentId, port, mode = 'chromium'] = process.argv.slice(2);
if (!componentId || !port) throw new Error('Usage: node tooling/browser/run-component.mjs <component> <port> [chromium|firefox|webkit|all]');
if (!['chromium', 'firefox', 'webkit', 'all'].includes(mode)) throw new Error(`Unknown browser mode: ${mode}`);

const component = discoverProductUnits().components.find((entry) => entry.component === componentId);
if (!component) throw new Error(`Unknown discovered component: ${componentId}`);
if (!component.ports?.[port]?.browser) throw new Error(`No browser evidence expected for ${componentId}/${port}`);

const projects = mode === 'all' ? ['chromium', 'firefox', 'webkit'] : [mode];
execFileSync(process.execPath, [component.browser.fixture, port], { stdio: 'inherit' });
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execFileSync(npx, ['playwright', 'install', '--with-deps', ...projects], { stdio: 'inherit' });
const projectArgs = projects.flatMap((project) => ['--project', project]);
execFileSync(npx, ['playwright', 'test', '--config', component.browser.config, ...projectArgs], {
  stdio: 'inherit',
  env: { ...process.env, VF_COMPONENT_PORT: port, VF_COMPONENT_ID: componentId }
});
