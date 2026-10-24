import test from'node:test';import assert from'node:assert/strict';test('Angular Select SSR',async()=>assert.ok((await import('@vyrnforge/angular/select')).VfSelectRootDirective));
