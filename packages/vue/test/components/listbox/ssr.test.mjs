import test from'node:test';import assert from'node:assert/strict';test('Vue Listbox SSR',async()=>assert.ok((await import('@vyrnforge/vue/listbox')).ListboxRoot));
