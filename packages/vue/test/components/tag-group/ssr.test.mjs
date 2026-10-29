import { test } from 'vitest';import assert from'node:assert/strict';test('Vue TagGroup SSR',async()=>assert.ok((await import('@vyrnforge/vue/tag-group')).TagGroupRoot));
