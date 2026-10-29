import { test } from 'vitest';import assert from'node:assert/strict';test('React Popover import is SSR-safe',async()=>assert.ok((await import('@vyrnforge/react/popover')).PopoverRoot));
