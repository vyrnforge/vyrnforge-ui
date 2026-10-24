import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { usePresence } from '@vyrnforge/vue/presence';
test('Vue Presence is server-safe and renders entered content', async () => {
  const app = createSSRApp({ setup() { const present = ref(true); const presence = usePresence(present); return () => presence.mounted.value ? h('div', { 'data-state': presence.state.value }, 'Content') : null; } });
  const html = await renderToString(app); assert.match(html, /data-state="entered"/);
});
