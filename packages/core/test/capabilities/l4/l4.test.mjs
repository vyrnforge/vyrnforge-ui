import test from 'node:test';
import assert from 'node:assert/strict';
import { navigationIntentForArrow, resolveEnabledIndex } from '../../../dist/capabilities/collection-navigation/index.js';
import { findTypeaheadMatch, normalizeTypeaheadText } from '../../../dist/capabilities/typeahead-matching/index.js';
import { addToSelection, normalizeSelection, removeFromSelection, replaceSelection, toggleSelection } from '../../../dist/capabilities/selection-operations/index.js';
import { activeDescendantId, resolveCompositeFocusIndex, rovingTabIndex } from '../../../dist/capabilities/composite-focus/index.js';

test('collection navigation supports direction and optional non-looping movement', () => {
  const items = [{}, { disabled: true }, {}];
  assert.equal(resolveEnabledIndex(items, 0, 'next', { loop: false }), 2);
  assert.equal(resolveEnabledIndex(items, 2, 'next', { loop: false }), null);
  assert.equal(resolveEnabledIndex(items, 2, 'next'), 0);
  assert.equal(navigationIntentForArrow('right', 'horizontal', 'ltr'), 'next');
  assert.equal(navigationIntentForArrow('right', 'horizontal', 'rtl'), 'previous');
  assert.equal(navigationIntentForArrow('down', 'vertical'), 'next');
  assert.equal(navigationIntentForArrow('left', 'vertical'), null);
});

test('typeahead matching normalizes text, skips disabled items, starts after the current item, and wraps by default', () => {
  const items = [
    { textValue: 'Álpha' },
    { textValue: 'Beta', disabled: true },
    { textValue: 'Blueberry' },
    { textValue: 'Cherry' },
  ];
  assert.equal(normalizeTypeaheadText('  ÁLpha  '), 'alpha');
  assert.equal(findTypeaheadMatch(items, 'bl', { startIndex: 0 }), 2);
  assert.equal(findTypeaheadMatch(items, 'al', { startIndex: 2 }), 0);
  assert.equal(findTypeaheadMatch(items, 'al', { startIndex: 2, wrap: false }), null);
  assert.equal(findTypeaheadMatch(items, 'be'), null);
});

test('selection operations are immutable, normalized, and comparator-aware', () => {
  assert.deepEqual(replaceSelection('a'), ['a']);
  assert.deepEqual(replaceSelection(null), []);
  assert.deepEqual(normalizeSelection(['a', 'a', 'b']), ['a', 'b']);
  assert.deepEqual(addToSelection(['a'], 'b'), ['a', 'b']);
  assert.deepEqual(removeFromSelection(['a', 'b'], 'a'), ['b']);
  assert.deepEqual(toggleSelection(['a'], 'a'), []);
  assert.deepEqual(toggleSelection(['a'], 'b'), ['a', 'b']);
});

test('composite focus calculations separate roving tabindex and virtual focus identity', () => {
  const items = [{ id: 'a' }, { id: 'b', disabled: true }, { id: 'c' }];
  assert.equal(resolveCompositeFocusIndex(items, 0, 'next'), 2);
  assert.equal(rovingTabIndex(0, 0), 0);
  assert.equal(rovingTabIndex(1, 1, true), -1);
  assert.equal(activeDescendantId(items, 2), 'c');
  assert.equal(activeDescendantId(items, 1), null);
});
