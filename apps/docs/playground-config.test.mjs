import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultsFor, normalizeConfiguration, changeConfiguration, jsxText } from './playground-config.mjs';

const fields = [
  { key: 'enabled', kind: 'boolean', default: false, label: 'Enabled' },
  { key: 'mode', kind: 'choice', default: 'a', label: 'Mode', options: [{ value: 'a' }, { value: 'b' }],
    available: config => config.enabled },
  { key: 'amount', kind: 'number', default: 2, label: 'Amount', min: 1, max: 5 },
];
test('defaults and invalid values normalize before preview and source', () => {
  assert.deepEqual(defaultsFor(fields), { enabled: false, mode: 'a', amount: 2 });
  assert.deepEqual(normalizeConfiguration(fields, { enabled: false, mode: 'b', amount: 100 }),
    { enabled: false, mode: 'a', amount: 5 });
  assert.deepEqual(normalizeConfiguration(fields, { enabled: 'false', mode: 'c', amount: NaN }),
    defaultsFor(fields));
});
test('resetting a controlling field clears incompatible state', () => {
  const active = changeConfiguration(fields, defaultsFor(fields), { enabled: true, mode: 'b' });
  assert.equal(active.mode, 'b');
  assert.equal(changeConfiguration(fields, active, { enabled: false }).mode, 'a');
});
test('authored text becomes a literal JSX expression', () => {
  assert.equal(jsxText('<Tag>{test}'), '{"<Tag>{test}"}');
});
