import { test } from 'vitest';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { componentResponsibilityDefinitions, discoverComponentRoots } from './component-paths.mjs';

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'vf-component-ownership-'));
  return { root, write(relativePath, content = '{}') {
    const target = path.join(root, relativePath);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  } };
}

test('responsibility and optional family preserve logical component IDs', () => {
  const { root, write } = fixture();
  write('product/components/elemental-primitives/typography/text/component.json');
  write('product/components/elemental-primitives/media/icon/component.json');
  write('product/components/interactive-controls/button/component.json', '{"id":"button"}');
  write('product/components/application-structures/app-shell/component.json');
  write('product/components/composite-widgets/transient-surfaces/dialog/component.json');
  const components = discoverComponentRoots(root);
  assert.equal(components.size, 5);
  assert.deepEqual(componentResponsibilityDefinitions.map(({ id }) => id), [
    'elemental-primitives', 'interactive-controls', 'composition-primitives',
    'composite-widgets', 'application-structures',
  ]);
  assert.deepEqual(components.get('text'), {
    id: 'text', root: 'product/components/elemental-primitives/typography/text',
    responsibility: 'elemental-primitives', family: 'typography',
  });
  assert.equal(components.get('button').family, null);
  assert.equal(components.get('dialog').family, 'transient-surfaces');
  assert.equal(components.get('app-shell').responsibility, 'application-structures');
  assert.equal(Object.hasOwn(components.get('button'), 'layer'), false);
});

test('duplicate canonical identities fail closed', () => {
  const { root, write } = fixture();
  write('product/components/elemental-primitives/button/component.json');
  write('product/components/interactive-controls/button/component.json');
  assert.throws(() => discoverComponentRoots(root), /Duplicate component owner for button/);
});

test('metadata IDs must match the final folder', () => {
  const { root, write } = fixture();
  write('product/components/interactive-controls/button/component.json', '{"id":"different"}');
  assert.throws(() => discoverComponentRoots(root), /Component ID must match its final folder/);
});

for (const [name, owner, error] of [
  ['flat', 'button/component.json', /Unknown component responsibility/],
  ['retired complex-ui', 'complex-ui/app-shell/component.json', /Unknown component responsibility/],
  ['retired behavioral infrastructure', 'behavioral-infrastructure/navigation/component.json', /Unknown component responsibility/],
  ['unknown root', 'unknown/button/component.json', /Unknown component responsibility/],
  ['invalid name', 'interactive-controls/BadName/component.json', /Invalid component ownership directory/],
  ['missing metadata', 'interactive-controls/button/web/index.css', /Missing component metadata/],
  ['unknown family', 'composite-widgets/unknown/dialog/component.json', /Missing component metadata/],
  ['excess depth', 'composite-widgets/transient-surfaces/group/dialog/component.json', /Missing component metadata/],
  ['responsibility as component', 'interactive-controls/component.json', /Ownership grouping must not be a component/],
  ['family as component', 'elemental-primitives/typography/component.json', /Ownership grouping must not be a component/],
]) {
  test('rejects ' + name + ' ownership', () => {
    const { root, write } = fixture();
    write('product/components/' + owner);
    assert.throws(() => discoverComponentRoots(root), error);
  });
}

test('a valid owner cannot conceal an additional nested component owner', () => {
  const { root, write } = fixture();
  write('product/components/interactive-controls/button/component.json');
  write('product/components/interactive-controls/button/nested/component.json');
  assert.throws(() => discoverComponentRoots(root), /Nested component ownership is not allowed/);
});
