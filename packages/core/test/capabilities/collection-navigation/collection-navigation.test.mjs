import test from 'node:test';
import assert from 'node:assert/strict';
import {
  enabledIndexForValue,
  firstEnabledIndex,
  lastEnabledIndex,
  navigationIntentForArrow,
  resolveEnabledIndex,
} from '../../../dist/capabilities/collection-navigation/index.js';

const items = [
  { value: 'one' },
  { value: 'two', disabled: true },
  { value: 'three' },
];

test('finds first and last enabled items', () => {
  assert.equal(firstEnabledIndex(items), 0);
  assert.equal(lastEnabledIndex(items), 2);
  assert.equal(firstEnabledIndex([{ disabled: true }]), null);
  assert.equal(lastEnabledIndex([{ disabled: true }]), null);
});

test('moves through enabled items with wrap and disabled skipping', () => {
  assert.equal(resolveEnabledIndex(items, 0, 'next'), 2);
  assert.equal(resolveEnabledIndex(items, 2, 'next'), 0);
  assert.equal(resolveEnabledIndex(items, 0, 'previous'), 2);
  assert.equal(resolveEnabledIndex(items, 2, 'previous'), 0);
  assert.equal(resolveEnabledIndex(items, 1, 'first'), 0);
  assert.equal(resolveEnabledIndex(items, 1, 'last'), 2);
});

test('supports bounded navigation when looping is disabled', () => {
  assert.equal(resolveEnabledIndex(items, 0, 'next', { loop: false }), 2);
  assert.equal(resolveEnabledIndex(items, 2, 'next', { loop: false }), null);
  assert.equal(resolveEnabledIndex(items, 2, 'previous', { loop: false }), 0);
  assert.equal(resolveEnabledIndex(items, 0, 'previous', { loop: false }), null);
});

test('maps arrow keys by orientation and text direction', () => {
  assert.equal(navigationIntentForArrow('right', 'horizontal', 'ltr'), 'next');
  assert.equal(navigationIntentForArrow('left', 'horizontal', 'ltr'), 'previous');
  assert.equal(navigationIntentForArrow('right', 'horizontal', 'rtl'), 'previous');
  assert.equal(navigationIntentForArrow('left', 'horizontal', 'rtl'), 'next');
  assert.equal(navigationIntentForArrow('down', 'vertical'), 'next');
  assert.equal(navigationIntentForArrow('up', 'vertical'), 'previous');
  assert.equal(navigationIntentForArrow('left', 'vertical'), null);
});

test('returns null when navigation has no eligible target', () => {
  assert.equal(resolveEnabledIndex([], 0, 'next'), null);
  assert.equal(resolveEnabledIndex([{ disabled: true }, { disabled: true }], 0, 'next'), null);
});

test('resolves requested eligible values and falls back to the first enabled item', () => {
  assert.equal(enabledIndexForValue(items, (item) => item.value === 'three'), 2);
  assert.equal(enabledIndexForValue(items, (item) => item.value === 'two'), 0);
  assert.equal(enabledIndexForValue(items, (item) => item.value === 'missing'), 0);
});
