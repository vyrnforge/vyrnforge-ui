import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { VisuallyHidden } from '@vyrnforge/vue/visually-hidden';
test('Vue VisuallyHidden preserves accessible content during SSR', async () => { const html = await renderToString(createSSRApp({ render: () => h(VisuallyHidden, { id: 'hidden-label' }, () => 'Notifications') })); assert.match(html, /^<span/); assert.match(html, /data-vf-visually-hidden(?:="")?/); assert.match(html, />Notifications<\/span>$/); assert.doesNotMatch(html, /aria-hidden| hidden=| inert=/); });
