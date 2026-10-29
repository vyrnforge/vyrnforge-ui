import { test } from 'vitest';import assert from'node:assert/strict';test('Angular Drawer import is SSR-safe',async()=>assert.ok((await import('@vyrnforge/angular/drawer')).VfDrawerRootDirective));
