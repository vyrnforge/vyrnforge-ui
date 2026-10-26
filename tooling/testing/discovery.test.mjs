import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { discoverProductUnits, productPreparationProblems } from '../testing/discover-product-units.mjs';

function writer(root) { return (relativePath, content = '') => { const target = path.join(root, relativePath); mkdirSync(path.dirname(target), { recursive: true }); writeFileSync(target, content); }; }

test('current Button is discovered from package subpaths and product ownership', () => {
  const { components } = discoverProductUnits();
  const button = components.find((entry) => entry.component === 'button');
  assert.ok(button);
  assert.deepEqual(Object.keys(button.ports).sort(), ['angular', 'react', 'vue', 'web']);
  assert.equal(button.ports.react.paths[0], 'packages/react/src/components/button/');
  assert.equal(button.ports.react.types, 'packages/react/test/components/button/api.types.ts');
  assert.equal(button.ports.react.ssr, 'packages/react/test/components/button/ssr.test.mjs');
  assert.equal(button.documentationSource, 'product/button/docs/index.html');
  assert.match(button.exampleManifests[0], /^product\/button\/examples\//);
  assert.equal(button.browser.fixture, 'product/button/test/browser/fixtures.mjs');
  assert.equal(button.accessibilityPath, 'product/button/accessibility.json');
  assert.ok(button.browser.paths.includes(button.accessibilityPath));
  assert.deepEqual(productPreparationProblems(), []);
});

test('shared Web foundation stylesheet exports are not component products', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-foundation-style-discovery-'));
  const write = writer(root);
  write('package.json', JSON.stringify({ workspaces: ['packages/web'] }));
  write('packages/web/package.json', JSON.stringify({
    name: '@vyrnforge/web',
    exports: {
      '.': './dist/index.js',
      './styles.css': './dist/styles.css',
      './styles/tokens.css': './dist/styles/tokens.css',
      './styles/foundation.css': './dist/styles/foundation.css',
      './styles/reset.css': './dist/styles/reset.css',
    },
  }));
  write('packages/web/src/styles/tokens.css');
  write('packages/web/src/styles/foundation.css');
  write('packages/web/src/styles/reset.css');
  const discovery = discoverProductUnits(root);
  assert.deepEqual(discovery.components, []);
  assert.deepEqual(productPreparationProblems(root), []);
});

test('a newly exposed component automatically requires its owned evidence', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-product-discovery-'));
  const write = writer(root);
  write('package.json', JSON.stringify({ workspaces: ['packages/core', 'packages/web', 'packages/react'] }));
  write('packages/core/package.json', JSON.stringify({ name: '@vyrnforge/core', exports: { '.': './dist/index.js' } }));
  write('packages/web/package.json', JSON.stringify({ name: '@vyrnforge/web', exports: { '.': './dist/index.js', './styles/tabs.css': './dist/components/tabs/tabs.css' } }));
  write('packages/react/package.json', JSON.stringify({ name: '@vyrnforge/react', exports: { '.': './dist/index.js', './tabs': './dist/components/tabs/index.js' } }));
  write('packages/react/src/components/tabs/index.ts', 'export const Tabs = null;\n');
  write('packages/web/src/components/tabs/tabs.css', '[data-vf-tabs] {}\n');
  write('product/tabs/docs/index.html', '<h2>Overview</h2>');
  write('product/tabs/examples/basic/example.json', JSON.stringify({ id: 'tabs/basic' }));
  write('product/tabs/changes/add-tabs.md', '---\ntype: minor\n---\n\nAdd Tabs.\n');
  const tabs = discoverProductUnits(root).components.find((entry) => entry.component === 'tabs');
  assert.ok(tabs);
  assert.deepEqual(Object.keys(tabs.ports).sort(), ['react', 'web']);
  assert.equal(tabs.accessibilityPath, 'product/tabs/accessibility.json');
  assert.ok(tabs.browser.paths.includes(tabs.accessibilityPath));
  const problems = productPreparationProblems(root);
  assert.ok(problems.some((problem) => problem.includes('packages/react/test/components/tabs/api.types.ts')));
  assert.ok(problems.some((problem) => problem.includes('packages/react/test/components/tabs/ssr.test.mjs')));
  assert.ok(problems.some((problem) => problem.includes('product/tabs/test/browser/fixtures.mjs')));
});

test('package-owned capabilities are auto-discovered with inferred dependency edges', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-unit-discovery-'));
  const write = writer(root);
  write('package.json', JSON.stringify({ workspaces: ['packages/core'] }));
  write('packages/core/package.json', JSON.stringify({ name: '@vyrnforge/core', exports: { '.': './dist/index.js' } }));
  write('packages/core/src/capabilities/eligibility/index.ts', 'export const eligible = () => true;\n');
  write('packages/core/test/capabilities/eligibility/eligibility.test.mjs', 'export {};\n');
  write('packages/core/src/capabilities/navigation/index.ts', "import { eligible } from '../eligibility/index.js';\nexport const next = eligible;\n");
  write('packages/core/test/capabilities/navigation/navigation.test.mjs', 'export {};\n');
  const units = discoverProductUnits(root).ownedUnits;
  const navigation = units.find((unit) => unit.id === 'navigation');
  assert.ok(navigation);
  assert.deepEqual(navigation.dependencies, ['unit:core:capabilities:eligibility']);
  assert.deepEqual(productPreparationProblems(root), []);
});

test('component ports infer owned-unit dependencies from workspace public subpaths', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-public-unit-dependency-'));
  const write = writer(root);
  write('package.json', JSON.stringify({ workspaces: ['packages/core', 'packages/react'] }));
  write('packages/core/package.json', JSON.stringify({
    name: '@vyrnforge/core',
    exports: {
      '.': './dist/index.js',
      './collection-navigation': {
        types: './dist/capabilities/collection-navigation/index.d.ts',
        import: './dist/capabilities/collection-navigation/index.js',
      },
    },
  }));
  write('packages/react/package.json', JSON.stringify({ name: '@vyrnforge/react', exports: { '.': './dist/index.js', './tabs': './dist/components/tabs/index.js' } }));
  write('packages/core/src/capabilities/collection-navigation/index.ts', 'export const next = () => 0;\n');
  write('packages/core/test/capabilities/collection-navigation/navigation.test.mjs', 'export {};\n');
  write('packages/react/src/components/tabs/index.ts', "import { next } from '@vyrnforge/core/collection-navigation';\nexport const Tabs = next;\n");
  const tabs = discoverProductUnits(root).components.find((entry) => entry.component === 'tabs');
  assert.ok(tabs);
  assert.deepEqual(tabs.ports.react.dependencies, ['unit:core:capabilities:collection-navigation']);
});
