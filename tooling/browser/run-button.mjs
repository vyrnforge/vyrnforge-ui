import { execFileSync } from 'node:child_process';

const port = process.argv[2] || 'web';
const mode = process.argv[3] || 'chromium';
if (!['web', 'react', 'angular', 'vue'].includes(port)) throw new Error(`Unknown Button browser port: ${port}`);
const projects = mode === 'all' ? ['chromium', 'firefox', 'webkit'] : [mode];
for (const project of projects) if (!['chromium', 'firefox', 'webkit'].includes(project)) throw new Error(`Unknown browser project: ${project}`);

execFileSync(process.execPath, ['tooling/browser/build-button-fixtures.mjs', port], { stdio: 'inherit' });
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execFileSync(npx, ['playwright', 'install', '--with-deps', ...projects], { stdio: 'inherit' });
const projectArgs = projects.flatMap((project) => ['--project', project]);
execFileSync(npx, ['playwright', 'test', '--config', 'tooling/browser/button.config.mjs', ...projectArgs], {
  stdio: 'inherit',
  env: { ...process.env, VF_BUTTON_PORT: port }
});
