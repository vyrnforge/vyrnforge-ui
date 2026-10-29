import { test } from 'vitest';import assert from'node:assert/strict';test('Angular Combobox SSR',async()=>assert.ok((await import('@vyrnforge/angular/combobox')).VfComboboxRootDirective));
