import { test } from 'vitest';
import assert from 'node:assert/strict';

test('Elements layout public entrypoint imports on the server without DOM registration side effects', async () => {
  const layout = await import('@vyrnforge/elements/layout');
  for (const name of [
    'VfStackElement',
    'VfInlineElement',
    'VfClusterElement',
    'VfGridElement',
    'VfContainerElement',
    'VfAspectRatioElement',
    'VfFieldElement',
    'VfFieldsetElement',
    'VfControlGroupElement',
    'VfRadioGroupElement',
    'defineLayoutElements',
  ]) {
    assert.equal(typeof layout[name], 'function', `${name} should be importable on the server`);
  }
});
