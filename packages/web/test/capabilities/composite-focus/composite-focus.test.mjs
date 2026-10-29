import { test } from 'vitest';
import assert from 'node:assert/strict';
import { applyActiveDescendant, applyRovingTabIndex, focusCompositeItem } from '../../../dist/capabilities/composite-focus/index.js';

test('browser composite-focus helpers execute committed focus without shared state', () => {
  const focused = [];
  const elements = [0, 1, 2].map((index) => ({ tabIndex: 0, matches: () => index === 1, focus: () => focused.push(index) }));
  applyRovingTabIndex(elements, 2);
  assert.deepEqual(elements.map((element) => element.tabIndex), [-1, -1, 0]);
  focusCompositeItem(elements, 2);
  assert.deepEqual(focused, [2]);
  const attrs = new Map();
  const container = { setAttribute: (name, value) => attrs.set(name, value), removeAttribute: (name) => attrs.delete(name) };
  applyActiveDescendant(container, 'option-2');
  assert.equal(attrs.get('aria-activedescendant'), 'option-2');
  applyActiveDescendant(container, null);
  assert.equal(attrs.has('aria-activedescendant'), false);
});
