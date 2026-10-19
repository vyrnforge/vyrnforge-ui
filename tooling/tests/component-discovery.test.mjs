import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { discoverComponents, componentPreparationProblems } from '../testing/discover-components.mjs';

test('current public component surfaces are discovered without a testing registry', () => {
  const { components } = discoverComponents();
  const button = components.find((entry) => entry.component === 'button');
  assert.ok(button);
  assert.deepEqual(Object.keys(button.ports).sort(), ['angular', 'react', 'vue', 'web']);
  assert.equal(button.documentationSource, 'documentation/components/button.html');
  assert.equal(button.types, 'tooling/types/button-api.ts');
  assert.match(button.exampleManifest, /^examples\/button\//);
  assert.deepEqual(componentPreparationProblems(), []);
});

test('a newly exposed component automatically becomes required testing work', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-component-discovery-'));
  const write = (relativePath, content) => {
    const target = path.join(root, relativePath);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  };

  for (const port of ['react', 'angular', 'vue', 'elements']) {
    write(`packages/${port}/package.json`, JSON.stringify({
      name: `@vyrnforge/${port}`,
      exports: port === 'react' ? { '.': './dist/index.js', './tabs': './dist/tabs.js' } : { '.': './dist/index.js' }
    }));
  }
  write('packages/web/package.json', JSON.stringify({
    name: '@vyrnforge/web',
    exports: { '.': './dist/index.js', './styles/tabs.css': './dist/styles/tabs.css' }
  }));
  write('documentation/site/registry.json', JSON.stringify({
    pages: [{ slug: 'components/tabs', source: 'documentation/components/tabs.html' }]
  }));
  write('documentation/components/tabs.html', '<h1>Tabs</h1>');
  write('examples/tabs/basic/example.json', JSON.stringify({ id: 'tabs/basic' }));
  write('packages/react/src/tabs.ts', 'export const Tabs = null;\n');
  write('packages/web/src/styles/tabs.css', '[data-vf-tabs] {}\n');

  const { components } = discoverComponents(root);
  const tabs = components.find((entry) => entry.component === 'tabs');
  assert.ok(tabs, 'Tabs should be discovered from public product surfaces');
  assert.deepEqual(Object.keys(tabs.ports).sort(), ['react', 'web']);

  const problems = componentPreparationProblems(root);
  assert.ok(problems.some((problem) => problem.includes('tooling/types/tabs-api.ts')));
  assert.ok(problems.some((problem) => problem.includes('tooling/tests/tabs-react.test.mjs')));
  assert.ok(problems.some((problem) => problem.includes('tooling/browser/run-tabs.mjs')));
});
