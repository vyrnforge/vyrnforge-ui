import { test } from 'vitest';
import assert from 'node:assert/strict';
import { addToSelection, normalizeSelection, removeFromSelection, replaceSelection, toggleSelection } from '../../../dist/capabilities/selection-operations/index.js';

test('selection operations are immutable and normalize duplicates', () => {
  assert.deepEqual(replaceSelection('a'), ['a']);
  assert.deepEqual(replaceSelection(null), []);
  assert.deepEqual(normalizeSelection(['a', 'a', 'b']), ['a', 'b']);
  assert.deepEqual(addToSelection(['a'], 'b'), ['a', 'b']);
  assert.deepEqual(removeFromSelection(['a', 'b'], 'a'), ['b']);
  assert.deepEqual(toggleSelection(['a'], 'a'), []);
  assert.deepEqual(toggleSelection(['a'], 'b'), ['a', 'b']);
});
