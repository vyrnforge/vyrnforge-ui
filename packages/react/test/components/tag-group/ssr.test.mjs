import { test } from 'vitest';import assert from'node:assert/strict';test('React TagGroup SSR',async()=>assert.ok((await import('@vyrnforge/react/tag-group')).TagGroupRoot));
