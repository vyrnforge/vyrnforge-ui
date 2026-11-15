import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'vitest';

const root = fileURLToPath(new URL('../../', import.meta.url));
const nx = createRequire(import.meta.url).resolve('nx/bin/nx.js');

function affectedBy(file) {
  const result = execFileSync(process.execPath, [nx, 'show', 'projects', '--affected', '--json', `--files=${file}`], {
    cwd: root,
    env: { ...process.env, NX_DAEMON: 'false', NX_NO_CLOUD: 'true' },
    encoding: 'utf8',
  });
  return JSON.parse(result);
}

test('Nx follows layered sources into their package targets and documentation', () => {
  const web = affectedBy('product/components/interactive-controls/button/web/button.css');
  assert.ok(web.includes('@vyrnforge/web'));
  assert.ok(web.includes('docs'));

  const react = affectedBy('product/components/composite-widgets/disclosure-view-switching/tabs/react/index.ts');
  assert.ok(react.includes('@vyrnforge/react'));
  assert.ok(!react.includes('@vyrnforge/vue'));

}, 30000);
