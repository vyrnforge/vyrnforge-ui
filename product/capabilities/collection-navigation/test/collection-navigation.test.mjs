import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  navigationIntentForArrow,
  resolveNavigationIndex,
} from '../core/index.ts';

const items = [
  { eligible: true },
  { eligible: false },
  { eligible: true },
];

test('resolves ordered movement, edges, eligibility and looping', () => {
  assert.equal(resolveNavigationIndex(items, 0, 'next'), 2);
  assert.equal(resolveNavigationIndex(items, 2, 'next'), 0);
  assert.equal(resolveNavigationIndex(items, 0, 'previous'), 2);
  assert.equal(resolveNavigationIndex(items, 1, 'first'), 0);
  assert.equal(resolveNavigationIndex(items, 1, 'last'), 2);
  assert.equal(resolveNavigationIndex(items, 2, 'next', { loop: false }), null);
  assert.equal(resolveNavigationIndex(items, 0, 'previous', { loop: false }), null);
});

test('treats omitted eligibility as eligible', () => {
  assert.equal(resolveNavigationIndex([{}, { eligible: false }, {}], 0, 'next'), 2);
});

test('handles empty, fully ineligible and invalid-current collections deterministically', () => {
  assert.equal(resolveNavigationIndex([], 0, 'next'), null);
  assert.equal(resolveNavigationIndex([{ eligible: false }, { eligible: false }], 0, 'next'), null);
  assert.equal(resolveNavigationIndex(items, -1, 'next'), 0);
  assert.equal(resolveNavigationIndex(items, -1, 'previous'), 2);
  assert.equal(resolveNavigationIndex(items, 99, 'next'), 0);
  assert.equal(resolveNavigationIndex(items, 99, 'previous'), 2);
  assert.equal(resolveNavigationIndex(items, Number.NaN, 'next'), 0);
});

test('maps arrows by orientation and writing direction', () => {
  assert.equal(navigationIntentForArrow('right', 'horizontal', 'ltr'), 'next');
  assert.equal(navigationIntentForArrow('left', 'horizontal', 'ltr'), 'previous');
  assert.equal(navigationIntentForArrow('right', 'horizontal', 'rtl'), 'previous');
  assert.equal(navigationIntentForArrow('left', 'horizontal', 'rtl'), 'next');
  assert.equal(navigationIntentForArrow('down', 'vertical'), 'next');
  assert.equal(navigationIntentForArrow('up', 'vertical'), 'previous');
  assert.equal(navigationIntentForArrow('left', 'vertical'), null);
});
