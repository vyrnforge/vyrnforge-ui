import test from'node:test';import assert from'node:assert/strict';test('Angular Tooltip import is SSR-safe',async()=>assert.ok((await import('@vyrnforge/angular/tooltip')).VfTooltipRootDirective));
