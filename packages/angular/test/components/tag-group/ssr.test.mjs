import test from'node:test';import assert from'node:assert/strict';test('Angular TagGroup SSR',async()=>assert.ok((await import('@vyrnforge/angular/tag-group')).VfTagGroupRootDirective));
