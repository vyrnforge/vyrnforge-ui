import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { Separator } from '@vyrnforge/vue/separator';
test('Vue Separator preserves native hr semantics during SSR', async () => { const html = await renderToString(createSSRApp({ render: () => h(Separator, { id: 'divider', orientation: 'vertical' }) })); assert.match(html, /^<hr/); assert.match(html, /data-vf-separator(?:="")?/); assert.match(html, /data-vf-separator-orientation="vertical"/); assert.match(html, /aria-orientation="vertical"/); });
