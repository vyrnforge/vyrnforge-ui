import test from 'node:test';
import assert from 'node:assert/strict';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '@vyrnforge/vue/tabs';

test('Vue Tabs server output contains complete tab relationships and state', async () => {
  const app = createSSRApp({
    render: () => h(TabsRoot, { id: 'account-tabs', defaultValue: 'overview' }, () => [
      h(TabsList, { 'aria-label': 'Account sections' }, () => [
        h(TabsTab, { value: 'overview' }, () => 'Overview'),
        h(TabsTab, { value: 'billing', disabled: true }, () => 'Billing'),
        h(TabsTab, { value: 'security' }, () => 'Security'),
      ]),
      h(TabsPanel, { value: 'overview' }, () => 'Overview panel'),
      h(TabsPanel, { value: 'billing' }, () => 'Billing panel'),
      h(TabsPanel, { value: 'security' }, () => 'Security panel'),
    ]),
  });
  const html = await renderToString(app);
  assert.match(html, /data-vf-tabs-root(?:="")?/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /id="account-tabs-tab-overview"[^>]*role="tab"[^>]*tabindex="0"[^>]*aria-selected="true"/);
  assert.match(html, /id="account-tabs-tab-billing"[^>]*role="tab"[^>]*disabled[^>]*aria-disabled="true"/);
  assert.match(html, /id="account-tabs-panel-security"[^>]*role="tabpanel"[^>]*hidden[^>]*aria-labelledby="account-tabs-tab-security"/);
});
