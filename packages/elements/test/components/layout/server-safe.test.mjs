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
    'VfControlGroupElement',
    'defineLayoutElements',
  ]) {
    assert.equal(typeof layout[name], 'function', `${name} should be importable on the server`);
  }

  assert.equal('VfFieldsetElement' in layout, false);
  assert.equal('defineFieldsetElement' in layout, false);
  assert.equal('VfRadioGroupElement' in layout, false);
  assert.equal('defineRadioGroupElement' in layout, false);
});
