import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { discoverProductUnits, repoRoot } from './discover-product-units.mjs';

const port = process.env.VF_COMPONENT_PORT || 'web';
const supportedPorts = new Set(['web', 'react', 'angular', 'vue', 'elements']);
if (!supportedPorts.has(port)) throw new Error(`Unsupported VyrnForge browser port: ${port}`);

const discovery = discoverProductUnits(repoRoot);
const testPaths = discovery.components
  .filter((component) => component.ports[port])
  .map((component) => component.browser.tests.replace(/\/$/, ''))
  .filter((relativePath) => existsSync(path.join(repoRoot, relativePath)));

if (testPaths.length === 0) throw new Error(`No browser evidence is owned by the ${port} port`);

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
execFileSync(process.execPath, ['tooling/testing/prepare-browser-fixtures.mjs'], { cwd: repoRoot, stdio: 'inherit', env: process.env });

const preload = `--import=${pathToFileURL(path.join(repoRoot, 'tooling/testing/playwright-globals.mjs')).href}`;
const nodeOptions = [process.env.NODE_OPTIONS, preload].filter(Boolean).join(' ');
const playwrightArgs = ['exec', 'playwright', 'test', ...process.argv.slice(2), ...testPaths];
console.log(`Running ${port} browser evidence for ${testPaths.length} discovered product owners.`);
execFileSync(pnpm, playwrightArgs, { cwd: repoRoot, stdio: 'inherit', env: { ...process.env, NODE_OPTIONS: nodeOptions } });
