import { test } from 'vitest';import assert from'node:assert/strict';test('React AlertDialog import is SSR-safe',async()=>assert.ok((await import('@vyrnforge/react/alert-dialog')).AlertDialogRoot));
