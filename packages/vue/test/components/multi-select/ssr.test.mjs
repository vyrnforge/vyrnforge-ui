import { test } from 'vitest';import assert from'node:assert/strict';test('Vue MultiSelect SSR',async()=>assert.ok((await import('@vyrnforge/vue/multi-select')).MultiSelectRoot));
