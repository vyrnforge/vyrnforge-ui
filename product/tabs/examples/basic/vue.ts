import { createApp, h } from 'vue';
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '@vyrnforge/vue/tabs';
import '@vyrnforge/web/styles/tabs.css';

createApp({
  render: () => h(TabsRoot, { id: 'example-tabs', defaultValue: 'overview' }, () => [
    h(TabsList, { 'aria-label': 'Account sections' }, () => [
      h(TabsTab, { value: 'overview' }, () => 'Overview'),
      h(TabsTab, { value: 'billing', disabled: true }, () => 'Billing'),
      h(TabsTab, { value: 'security' }, () => 'Security'),
    ]),
    h(TabsPanel, { value: 'overview' }, () => 'Overview content'),
    h(TabsPanel, { value: 'billing' }, () => 'Billing content'),
    h(TabsPanel, { value: 'security' }, () => 'Security content'),
  ]),
}).mount('#root');
