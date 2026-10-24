import test from'node:test';import assert from'node:assert/strict';test('Vue AlertDialog import is SSR-safe',async()=>assert.ok((await import('@vyrnforge/vue/alert-dialog')).AlertDialogRoot));
