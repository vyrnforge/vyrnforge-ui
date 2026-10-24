import test from 'node:test';
import assert from 'node:assert/strict';
import { computeFloatingPosition } from '../../../dist/capabilities/floating-positioning/index.js';

test('floating positioning flips and shifts within viewport constraints', () => {
  const anchor = { left: 80, top: 90, right: 100, bottom: 100, width: 20, height: 10 };
  const viewport = { left: 0, top: 0, right: 120, bottom: 120, width: 120, height: 120 };
  const result = computeFloatingPosition(anchor, { width: 60, height: 40 }, viewport, { placement: 'bottom-end', padding: 8, offset: 4, arrowSize: 8 });
  assert.equal(result.placement, 'top-end');
  assert.ok(result.x >= 8);
  assert.ok(result.y >= 8);
  assert.notEqual(result.arrowX, null);
});
