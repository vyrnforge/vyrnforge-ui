import { test } from 'vitest';import assert from'node:assert/strict';test('Vue Combobox SSR',async()=>assert.ok((await import('@vyrnforge/vue/combobox')).ComboboxRoot));
