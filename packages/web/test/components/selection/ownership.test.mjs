import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const readPackage = (path) => readFile(new URL(`../../../src/${path}`, import.meta.url), 'utf8');
const readComponent = (id) => readFile(new URL(`../../../../../product/components/composite-widgets/collection-selection/${id}/web/${id}.css`, import.meta.url), 'utf8');

test('selection-family component styles compose one private shared stylesheet', async () => {
  const [shared, listbox, select, combobox, multiSelect] = await Promise.all([
    readPackage('styles/selection.css'),
    readComponent('listbox'),
    readComponent('select'),
    readComponent('combobox'),
    readComponent('multi-select'),
  ]);

  const sharedImport = /^@import\s+(['"])\.\.\/\.\.\/styles\/selection\.css\1;$/;
  assert.match(listbox.trim(), sharedImport);
  assert.match(select.trim(), sharedImport);
  assert.match(combobox, /@import\s+(['"])\.\.\/\.\.\/styles\/selection\.css\1;/);
  assert.match(multiSelect, /@import\s+(['"])\.\.\/\.\.\/styles\/selection\.css\1;/);

  assert.match(shared, /data-vf-listbox-root/);
  assert.match(shared, /data-vf-select-content/);
  assert.match(shared, /data-vf-combobox-content/);
  assert.match(shared, /data-vf-multi-select-content/);
  assert.match(shared, /data-vf-select-option/);
  assert.match(shared, /data-vf-combobox-option/);
  assert.match(shared, /data-vf-multi-select-option/);
  assert.match(shared, /data-vf-listbox-option/);
  assert.match(shared, /data-vf-select-trigger/);
  assert.match(shared, /data-vf-multi-select-trigger/);
  assert.match(shared, /\[data-vf-select-content\]\[hidden\]/);
  assert.match(shared, /\[data-vf-combobox-content\]\[hidden\]/);
  assert.match(shared, /\[data-vf-multi-select-content\]\[hidden\]/);
  assert.match(shared, /display:\s*none/);

  assert.doesNotMatch(listbox, /data-vf-(?:select|combobox|multi-select)-/);
  assert.doesNotMatch(select, /data-vf-(?:listbox|combobox|multi-select)-/);
  assert.doesNotMatch(combobox, /data-vf-(?:listbox|select|multi-select)-(?:content|option|trigger)/);
  assert.doesNotMatch(multiSelect, /data-vf-(?:listbox|select|combobox)-/);
});

test('selection-family shared stylesheet remains private package infrastructure', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../../../package.json', import.meta.url), 'utf8'));
  assert.equal(packageJson.exports['./styles/selection.css'], undefined);
});
