import { test } from 'vitest';import assert from'node:assert/strict';test('Angular MultiSelect SSR',async()=>assert.ok((await import('@vyrnforge/angular/multi-select')).VfMultiSelectRootDirective));
