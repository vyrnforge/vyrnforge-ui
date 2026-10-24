import test from'node:test';import assert from'node:assert/strict';test('Vue PreviewCard import is SSR-safe',async()=>assert.ok((await import('@vyrnforge/vue/preview-card')).PreviewCardRoot));
