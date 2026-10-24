import test from'node:test';import assert from'node:assert/strict';test('Angular ToggleGroup SSR',async()=>assert.ok((await import('@vyrnforge/angular/toggle-group')).VfToggleGroupRootDirective));
