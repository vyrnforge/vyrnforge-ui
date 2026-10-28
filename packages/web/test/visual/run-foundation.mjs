import { execFileSync } from 'node:child_process';

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
if (process.env.VF_PLAYWRIGHT_READY !== '1') {
  execFileSync(npx, ['playwright', 'install', '--with-deps', 'chromium'], { stdio: 'inherit' });
}
execFileSync(npx, ['playwright', 'test', '--config', 'packages/web/test/visual/playwright.config.mjs', '--project', 'chromium'], { stdio: 'inherit' });
