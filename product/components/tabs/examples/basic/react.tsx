import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { TabsList, TabsPanel, TabsRoot, TabsTab } from '@vyrnforge/react/tabs';
import '@vyrnforge/web/styles/tabs.css';

function App() {
  return (
    <TabsRoot id="example-tabs" defaultValue="overview">
      <TabsList aria-label="Account sections">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="billing" disabled>Billing</TabsTab>
        <TabsTab value="security">Security</TabsTab>
      </TabsList>
      <TabsPanel value="overview">Overview content</TabsPanel>
      <TabsPanel value="billing">Billing content</TabsPanel>
      <TabsPanel value="security">Security content</TabsPanel>
    </TabsRoot>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
