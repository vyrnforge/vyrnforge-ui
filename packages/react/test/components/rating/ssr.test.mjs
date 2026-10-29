import { test } from 'vitest';import assert from'node:assert/strict';test('React Rating SSR',async()=>assert.ok((await import('@vyrnforge/react/rating')).RatingRoot));
