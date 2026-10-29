import { test } from 'vitest';import assert from'node:assert/strict';test('Vue Select SSR',async()=>assert.ok((await import('@vyrnforge/vue/select')).SelectRoot));
