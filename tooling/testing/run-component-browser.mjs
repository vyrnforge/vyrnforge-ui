import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { discoverProductUnits } from './discover-product-units.mjs';

const [componentId, port, mode = 'chromium'] = process.argv.slice(2);
if (!componentId || !port) throw new Error('Usage: node tooling/testing/run-component-browser.mjs <component> <port> [chromium|firefox|webkit|all]');
if (!['chromium', 'firefox', 'webkit', 'all'].includes(mode)) throw new Error(`Unknown browser mode: ${mode}`);

const component = discoverProductUnits().components.find((entry) => entry.component === componentId);
if (!component) throw new Error(`Unknown discovered component: ${componentId}`);
if (!component.ports?.[port]?.browser) throw new Error(`No browser evidence expected for ${componentId}/${port}`);

const projects = mode === 'all' ? ['chromium', 'firefox', 'webkit'] : [mode];
execFileSync(process.execPath, [component.browser.fixture, port], { stdio: 'inherit' });

const fixtureDocument = path.join(process.cwd(), 'dist', 'docs', 'next', `${componentId}-fixtures`, `${port}.html`);
if (existsSync(fixtureDocument)) {
  let fixtureHtml = await readFile(fixtureDocument, 'utf8');
  const fixtureTitle = `${componentId} ${port} component fixture`;
  if (!/<title(?:\s|>)/i.test(fixtureHtml)) {
    if (/<head(?:\s[^>]*)?>/i.test(fixtureHtml)) {
      fixtureHtml = fixtureHtml.replace(/<head(\s[^>]*)?>/i, (match) => `${match}<title>${fixtureTitle}</title>`);
    } else {
      fixtureHtml = fixtureHtml.replace(/<html(\s[^>]*)?>/i, (match) => `${match}<head><title>${fixtureTitle}</title></head>`);
    }
  }
  if (!/<main(?:\s|>)/i.test(fixtureHtml)) {
    fixtureHtml = fixtureHtml.replace(/<body(\s[^>]*)?>([\s\S]*?)<\/body>/i, (_match, attributes = '', body) => `<body${attributes}><main>${body}</main></body>`);
  }
  if (!/<h1(?:\s|>)/i.test(fixtureHtml)) {
    if (/<main(?:\s[^>]*)?>/i.test(fixtureHtml)) {
      fixtureHtml = fixtureHtml.replace(/<main(\s[^>]*)?>/i, (match) => `${match}<h1>${fixtureTitle}</h1>`);
    } else {
      fixtureHtml = fixtureHtml.replace(/<body(\s[^>]*)?>/i, (match) => `${match}<h1>${fixtureTitle}</h1>`);
    }
  }
  await writeFile(fixtureDocument, fixtureHtml);
}

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
if (process.env.VF_PLAYWRIGHT_READY !== '1') {
  execFileSync(npx, ['playwright', 'install', '--with-deps', ...projects], { stdio: 'inherit' });
}
const projectArgs = projects.flatMap((project) => ['--project', project]);
execFileSync(npx, ['playwright', 'test', '--config', component.browser.config, ...projectArgs], {
  stdio: 'inherit',
  env: { ...process.env, VF_COMPONENT_PORT: port, VF_COMPONENT_ID: componentId }
});
