import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const port = process.env.VF_COMPONENT_PORT || 'web';
const supportedPorts = new Set(['web', 'react', 'angular', 'vue', 'elements']);
if (!supportedPorts.has(port)) throw new Error(`Unsupported VyrnForge browser port: ${port}`);

const outputRoot = path.join(root, 'dist/browser-fixtures');
rmSync(outputRoot, { recursive: true, force: true });

const productRoot = path.join(root, 'product');
const components = readdirSync(productRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
  .map((entry) => entry.name)
  .sort();

let fixtureScripts = 0;
for (const component of components) {
  const fixture = path.join(productRoot, component, 'test/browser/fixtures.mjs');
  if (!existsSync(fixture)) continue;
  fixtureScripts += 1;
  execFileSync(process.execPath, [fixture, port], { cwd: root, stdio: 'inherit' });
}

function countPortPages(directory) {
  if (!existsSync(directory)) return 0;
  let count = 0;
  const stack = [directory];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (entry.name === `${port}.html`) count += 1;
    }
  }
  return count;
}

const pages = countPortPages(outputRoot);
if (fixtureScripts === 0 || pages === 0) {
  throw new Error(`Browser fixture preparation produced no ${port} evidence pages`);
}

console.log(`Prepared ${pages} ${port} browser fixture pages from ${fixtureScripts} component fixture scripts.`);
