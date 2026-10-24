import test from'node:test';import assert from'node:assert/strict';test('Vue SegmentedControl SSR',async()=>assert.ok((await import('@vyrnforge/vue/segmented-control')).SegmentedControlRoot));
