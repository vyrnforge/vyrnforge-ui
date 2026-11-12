import { test } from 'vitest';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { componentLayerDefinitions, discoverComponentRoots } from './component-paths.mjs';

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-component-layers-'));
  const write = (name, content = '{}') => {
    const file = path.join(root, name);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
  };
  return { root, write };
}

test('nested layer and optional typography category preserve stable component IDs', () => {
  const { root, write } = fixture();
  write('product/components/elemental-primitives/typography/text/component.json');
  write('product/components/elemental-primitives/icon/component.json');
  write('product/components/interactive-controls/button/component.json', '{"id":"button"}');
  write('product/components/legacy-flat/component.json');
  const components = discoverComponentRoots(root);
  assert.equal(components.size, 4);
  assert.deepEqual(componentLayerDefinitions.map((layer) => layer.id), [
    'elemental-primitives', 'interactive-controls', 'composition-primitives',
    'behavioral-infrastructure', 'composite-components', 'complex-components',
  ]);
  assert.deepEqual(components.get('text'), {
    id: 'text', root: 'product/components/elemental-primitives/typography/text',
    layer: 'elemental-primitives', category: 'typography', flat: false,
  });
  assert.equal(components.get('icon').category, null);
  assert.equal(components.get('button').layer, 'interactive-controls');
  assert.equal(components.get('legacy-flat').layer, null);
  assert.equal(components.get('legacy-flat').flat, true);
});

test('duplicate flat/nested component identities fail instead of silently selecting a source', () => {
  const { root, write } = fixture();
  write('product/components/button/component.json');
  write('product/components/interactive-controls/button/component.json');
  assert.throws(() => discoverComponentRoots(root), /Duplicate component owner for button/);
});

test('nested metadata cannot silently change its published component ID', () => {
  const { root, write } = fixture();
  write('product/components/interactive-controls/button/component.json', '{"id":"different"}');
  assert.throws(() => discoverComponentRoots(root), /Component ID must match its final folder/);
});
