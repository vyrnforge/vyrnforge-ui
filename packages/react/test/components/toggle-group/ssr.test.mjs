import test from'node:test';import assert from'node:assert/strict';test('React ToggleGroup SSR',async()=>assert.ok((await import('@vyrnforge/react/toggle-group')).ToggleGroupRoot));
