import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { test } from 'vitest';

const read = (path) => readFile(new URL(`../../../src/${path}`, import.meta.url), 'utf8');

test('selection-family component styles compose one private shared stylesheet', async () => {
  const [shared, listbox, select, combobox, multiSelect] = await Promise.all([
    read('styles/selection.css'),
    read('components/listbox/listbox.css'),
    read('components/select/select.css'),
    read('components/combobox/combobox.css'),
    read('components/multi-select/multi-select.css'),
  ]);

  const sharedImport = '@import "../../styles/selection.css";';
  assert.equal(listbox.trim(), sharedImport);
  assert.equal(select.trim(), sharedImport);
  assert.match(combobox, /@import "\.\.\/\.\.\/styles\/selection\.css";/);
  assert.match(multiSelect, /@import "\.\.\/\.\.\/styles\/selection\.css";/);

  assert.match(shared, /data-vf-listbox-root/);
  assert.match(shared, /data-vf-select-content/);
  assert.match(shared, /data-vf-combobox-content/);
  assert.match(shared, /data-vf-multi-select-content/);
  assert.match(shared, /data-vf-listbox-option/);
  assert.match(shared, /data-vf-select-option/);
  assert.match(shared, /data-vf-combobox-option/);
  assert.match(shared, /data-vf-multi-select-option/);
  assert.match(shared, /data-vf-select-trigger/);
  assert.match(shared, /data-vf-multi-select-trigger/);

  assert.doesNotMatch(listbox, /data-vf-(?:select|combobox|multi-select)-/);
  assert.doesNotMatch(select, /data-vf-(?:listbox|combobox|multi-select)-/);
  assert.doesNotMatch(combobox, /data-vf-(?:listbox|select|multi-select)-(?:content|option|trigger)/);
  assert.doesNotMatch(multiSelect, /data-vf-(?:listbox|select|combobox)-/);
});

test('selection-family shared stylesheet remains private package infrastructure', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../../../package.json', import.meta.url), 'utf8'));
  assert.equal(packageJson.exports['./styles/selection.css'], undefined);
});
