import { test } from 'vitest';import assert from'node:assert/strict';test('React MultiSelect SSR',async()=>assert.ok((await import('@vyrnforge/react/multi-select')).MultiSelectRoot));
