import test from'node:test';import assert from'node:assert/strict';test('Angular Rating SSR',async()=>assert.ok((await import('@vyrnforge/angular/rating')).VfRatingRootDirective));
