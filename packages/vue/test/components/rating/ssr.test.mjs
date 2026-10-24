import test from'node:test';import assert from'node:assert/strict';test('Vue Rating SSR',async()=>assert.ok((await import('@vyrnforge/vue/rating')).RatingRoot));
