import { test } from 'vitest';import assert from'node:assert/strict';test('React SegmentedControl SSR',async()=>assert.ok((await import('@vyrnforge/react/segmented-control')).SegmentedControlRoot));
