import { test } from 'vitest';import assert from'node:assert/strict';test('Angular Listbox SSR',async()=>assert.ok((await import('@vyrnforge/angular/listbox')).VfListboxRootDirective));
