import { test } from 'vitest';import assert from'node:assert/strict';test('Vue Tooltip import is SSR-safe',async()=>assert.ok((await import('@vyrnforge/vue/tooltip')).TooltipRoot));
