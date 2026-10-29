import { test } from 'vitest';import assert from'node:assert/strict';test('React Combobox SSR',async()=>assert.ok((await import('@vyrnforge/react/combobox')).ComboboxRoot));
