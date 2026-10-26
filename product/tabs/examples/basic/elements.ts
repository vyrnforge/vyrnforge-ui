import { defineTabsElement } from '@vyrnforge/elements/tabs';
import '@vyrnforge/web/styles/tabs.css';

defineTabsElement();

document.querySelector('#root')!.innerHTML = `
  <vf-tabs id="example-tabs" default-value="overview">
    <div data-vf-tabs-list aria-label="Account sections">
      <button data-vf-tabs-tab data-vf-value="overview">Overview</button>
      <button data-vf-tabs-tab data-vf-value="billing" disabled>Billing</button>
      <button data-vf-tabs-tab data-vf-value="security">Security</button>
    </div>
    <div data-vf-tabs-panel data-vf-value="overview">Overview content</div>
    <div data-vf-tabs-panel data-vf-value="billing">Billing content</div>
    <div data-vf-tabs-panel data-vf-value="security">Security content</div>
  </vf-tabs>
`;
