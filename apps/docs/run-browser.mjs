import { execFileSync } from 'node:child_process';

const mode = process.argv[2] || 'chromium';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const projects = mode === 'all' ? ['chromium', 'firefox', 'webkit'] : [mode];
for (const project of projects) {
  if (!['chromium', 'firefox', 'webkit'].includes(project)) throw new Error(`Unknown browser project: ${project}`);
}

if (process.env.VF_PLAYWRIGHT_READY !== '1') {
  execFileSync(npx, ['playwright', 'install', '--with-deps', ...projects], { stdio: 'inherit' });
}
const projectArgs = projects.flatMap((project) => ['--project', project]);
execFileSync(npx, ['playwright', 'test', '--config', 'apps/docs/playwright.config.mjs', ...projectArgs], { stdio: 'inherit' });
