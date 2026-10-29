import { test } from 'vitest';import assert from'node:assert/strict';test('React PreviewCard import is SSR-safe',async()=>assert.ok((await import('@vyrnforge/react/preview-card')).PreviewCardRoot));
