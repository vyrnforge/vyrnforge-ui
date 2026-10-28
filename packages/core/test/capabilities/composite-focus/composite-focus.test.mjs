import { test } from 'vitest';
import assert from 'node:assert/strict';
import { activeDescendantId, resolveCompositeFocusIndex, rovingTabIndex } from '../../../dist/capabilities/composite-focus/index.js';

test('composite focus separates roving tabindex and virtual focus calculations', () => {
  const items = [{ id: 'a' }, { id: 'b', disabled: true }, { id: 'c' }];
  assert.equal(resolveCompositeFocusIndex(items, 0, 'next'), 2);
  assert.equal(rovingTabIndex(0, 0), 0);
  assert.equal(rovingTabIndex(1, 1, true), -1);
  assert.equal(activeDescendantId(items, 2), 'c');
  assert.equal(activeDescendantId(items, 1), null);
});
