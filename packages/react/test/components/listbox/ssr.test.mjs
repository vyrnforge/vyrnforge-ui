import test from'node:test';import assert from'node:assert/strict';test('React Listbox SSR',async()=>assert.ok((await import('@vyrnforge/react/listbox')).ListboxRoot));
