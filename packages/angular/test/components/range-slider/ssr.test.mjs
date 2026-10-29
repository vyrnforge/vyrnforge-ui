import { test } from 'vitest';import assert from'node:assert/strict';test('Angular RangeSlider SSR',async()=>assert.ok((await import('@vyrnforge/angular/range-slider')).VfRangeSliderRootDirective));
