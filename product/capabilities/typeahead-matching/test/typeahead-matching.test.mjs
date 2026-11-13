import { test } from 'vitest';
import assert from 'node:assert/strict';
import { findTypeaheadMatch } from '../core/index.ts';

const items = [
  { textValue: 'Álpha' },
  { textValue: 'Beta', eligible: false },
  { textValue: 'Blueberry' },
  { textValue: 'Cherry' },
];

test('matches normalized prefixes, skips ineligible items, starts after current item and wraps', () => {
  assert.equal(findTypeaheadMatch(items, 'bl', { startIndex: 0 }), 2);
  assert.equal(findTypeaheadMatch(items, 'al', { startIndex: 2 }), 0);
  assert.equal(findTypeaheadMatch(items, 'al', { startIndex: 2, wrap: false }), null);
  assert.equal(findTypeaheadMatch(items, 'be'), null);
});

test('normalizes Unicode marks, casing and internal whitespace as part of matching', () => {
  const values = [{ textValue: '  Ångström   Unit  ' }, { textValue: 'Other' }];
  assert.equal(findTypeaheadMatch(values, 'angstrom u'), 0);
  assert.equal(findTypeaheadMatch(values, '  ANGSTROM   UNIT '), 0);
});

test('supports locale-aware casing', () => {
  assert.equal(findTypeaheadMatch([{ textValue: 'Istanbul' }], 'ı', { locale: 'tr' }), 0);
});

test('handles empty queries, empty collections, invalid starts and non-wrapping boundaries', () => {
  assert.equal(findTypeaheadMatch([], 'a'), null);
  assert.equal(findTypeaheadMatch(items, '   '), null);
  assert.equal(findTypeaheadMatch(items, 'al', { startIndex: 99 }), 0);
  assert.equal(findTypeaheadMatch(items, 'al', { startIndex: Number.NaN }), 0);
  assert.equal(findTypeaheadMatch(items, 'al', { startIndex: 3, wrap: false }), null);
});

test('uses collection order when multiple items match', () => {
  const values = [{ textValue: 'Apple' }, { textValue: 'Apricot' }, { textValue: 'Avocado' }];
  assert.equal(findTypeaheadMatch(values, 'a', { startIndex: 0 }), 1);
  assert.equal(findTypeaheadMatch(values, 'a', { startIndex: 1 }), 2);
  assert.equal(findTypeaheadMatch(values, 'a', { startIndex: 2 }), 0);
});
