import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFloatingPosition } from '../../../dist/capabilities/floating-positioning/index.js';
import { applyActiveDescendant, applyRovingTabIndex, focusCompositeItem } from '../../../dist/capabilities/composite-focus/index.js';

test('floating positioning flips and shifts inside the viewport', () => {
  const anchor = { left: 80, top: 90, right: 100, bottom: 100, width: 20, height: 10 };
  const viewport = { left: 0, top: 0, right: 120, bottom: 120, width: 120, height: 120 };
  const result = computeFloatingPosition(anchor, { width: 60, height: 40 }, viewport, { placement: 'bottom-end', padding: 8, offset: 4, arrowSize: 8 });
  assert.equal(result.placement, 'top-end');
  assert.ok(result.x >= 8);
  assert.ok(result.y >= 8);
  assert.notEqual(result.arrowX, null);
});

test('composite focus browser helpers update roving and virtual focus without shared state', () => {
  const focused = [];
  const elements = [0, 1, 2].map((index) => ({
    tabIndex: 0,
    matches: () => index === 1,
    focus: () => focused.push(index),
  }));
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
