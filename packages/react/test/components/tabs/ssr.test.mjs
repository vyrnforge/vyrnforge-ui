import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '@vyrnforge/react/tabs';

test('React Tabs server output contains complete tab relationships and state', () => {
  const html = renderToStaticMarkup(createElement(
    TabsRoot,
    { id: 'account-tabs', defaultValue: 'overview' },
    createElement(TabsList, { 'aria-label': 'Account sections' },
      createElement(TabsTab, { value: 'overview' }, 'Overview'),
      createElement(TabsTab, { value: 'billing', disabled: true }, 'Billing'),
      createElement(TabsTab, { value: 'security' }, 'Security'),
    ),
    createElement(TabsPanel, { value: 'overview' }, 'Overview panel'),
    createElement(TabsPanel, { value: 'billing' }, 'Billing panel'),
    createElement(TabsPanel, { value: 'security' }, 'Security panel'),
  ));

  assert.match(html, /data-vf-tabs-root=""/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /aria-orientation="horizontal"/);
  assert.match(html, /id="account-tabs-tab-overview"[^>]*role="tab"[^>]*tabindex="0"[^>]*aria-selected="true"[^>]*aria-controls="account-tabs-panel-overview"/);
  assert.match(html, /id="account-tabs-tab-billing"[^>]*role="tab"[^>]*disabled=""[^>]*tabindex="-1"[^>]*aria-selected="false"[^>]*aria-disabled="true"/);
  assert.match(html, /id="account-tabs-panel-overview"[^>]*role="tabpanel"[^>]*aria-labelledby="account-tabs-tab-overview"/);
  assert.match(html, /id="account-tabs-panel-security"[^>]*role="tabpanel"[^>]*hidden=""[^>]*aria-labelledby="account-tabs-tab-security"/);
});
