import { test } from 'vitest';import assert from'node:assert/strict';test('Vue RangeSlider SSR',async()=>assert.ok((await import('@vyrnforge/vue/range-slider')).RangeSliderRoot));
