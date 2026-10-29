import { test } from 'vitest';import assert from'node:assert/strict';test('Vue ToggleGroup SSR',async()=>assert.ok((await import('@vyrnforge/vue/toggle-group')).ToggleGroupRoot));
