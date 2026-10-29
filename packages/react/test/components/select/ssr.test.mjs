import { test } from 'vitest';import assert from'node:assert/strict';test('React Select SSR',async()=>assert.ok((await import('@vyrnforge/react/select')).SelectRoot));
