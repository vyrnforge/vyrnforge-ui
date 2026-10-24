import test from'node:test';import assert from'node:assert/strict';test('React RangeSlider SSR',async()=>assert.ok((await import('@vyrnforge/react/range-slider')).RangeSliderRoot));
