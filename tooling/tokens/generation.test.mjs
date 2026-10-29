import { test } from 'vitest';
import assert from 'node:assert/strict';
import { assertGeneratedOutputCurrent } from './generation.mjs';

test('accepts current deterministic generated output', () => {
  assert.doesNotThrow(() => assertGeneratedOutputCurrent('same', 'same'));
});

test('rejects stale generated output with the canonical remediation', () => {
  assert.throws(
    () => assertGeneratedOutputCurrent('stale', 'expected'),
    /packages\/web\/src\/styles\/tokens\.css is stale; run pnpm generate:tokens --write/,
  );
});
