import { test } from 'vitest';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { reactBrowserCssPlan, writeReactBrowserCss } from './react-browser-css.mjs';

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'vf-react-browser-css-'));
  const write = (file, content) => {
    const full = path.join(root, file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, content);
  };
  const react = {
    exports: {
      '.': { types: './dist/index.d.ts', browser: './dist/browser.js', import: './dist/index.js', default: './dist/index.js' },
      './code': { types: './dist/components/code/index.d.ts', browser: './dist/components/code/browser.js', import: './dist/components/code/index.js', default: './dist/components/code/index.js' },
    },
    sideEffects: ['./dist/browser.js', './dist/components/*/browser.js'],
  };
  const web = { exports: {
    './styles.css': './dist/styles.css',
    './styles/code.css': './dist/components/code/code.css',
    './styles/text.css': './dist/components/text/text.css',
  } };
  const graph = { components: [{
    unitId: 'code',
    metadataPath: 'product/components/typography/code/component.json',
    surfaces: { react: { publicEntrypoints: ['@vyrnforge/react/code'] } },
  }] };
  write('product/components/typography/code/component.json', JSON.stringify({ id: 'code', styling: { dependencies: ['text'] } }));
  write('packages/react/dist/index.js', 'export const Code = 1;');
  write('packages/react/dist/components/code/index.js', 'export const Code = 1;');
  return { root, write, react, web, graph };
}

test('React browser CSS follows public Product Graph styles and preserves Node JS exports', () => {
  const f = fixture();
  const plan = reactBrowserCssPlan(f);
  assert.deepEqual(plan.components.map((entry) => entry.component), ['code']);
  assert.deepEqual(plan.components[0].cssIds, ['text', 'code']);
  assert.equal(plan.root.source, "import '@vyrnforge/web/styles.css';\nexport * from './index.js';\n");
  writeReactBrowserCss(f);
  assert.equal(
    readFileSync(path.join(f.root, 'packages/react/dist/components/code/browser.js'), 'utf8'),
    "import '@vyrnforge/web/styles/text.css';\nimport '@vyrnforge/web/styles/code.css';\nexport * from './index.js';\n",
  );
});

test('React browser export validation fails closed on missing styles, missing side effects, or incorrect SSR paths', () => {
  const f = fixture();
  delete f.web.exports['./styles/text.css'];
  assert.throws(() => reactBrowserCssPlan(f), /depends on missing canonical Web styling text/);
  f.web.exports['./styles/text.css'] = './dist/components/text/text.css';
  f.react.sideEffects = false;
  assert.throws(() => reactBrowserCssPlan(f), /side effects/);
  f.react.sideEffects = ['./dist/browser.js', './dist/components/*/browser.js'];
  f.react.exports['./code'].import = './dist/components/code/browser.js';
  assert.throws(() => reactBrowserCssPlan(f), /conditional export drift/);
});

test('React browser CSS planner covers exactly all current React public component subpaths', () => {
  const plan = reactBrowserCssPlan();
  assert.ok(plan.components.length >= 40);
  assert.ok(plan.components.some((entry) => entry.component === 'text'));
  assert.deepEqual(plan.components.find((entry) => entry.component === 'kbd').cssIds, ['text', 'kbd']);
  assert.ok(plan.components.every((entry) => !entry.source.includes('reset.css')));
});
