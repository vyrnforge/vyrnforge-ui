import test from'node:test';import assert from'node:assert/strict';test('React Tooltip import is SSR-safe',async()=>assert.ok((await import('@vyrnforge/react/tooltip')).TooltipRoot));
