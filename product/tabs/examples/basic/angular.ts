import '@angular/compiler';
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  VfTabsListDirective,
  VfTabsPanelDirective,
  VfTabsRootDirective,
  VfTabsTabDirective,
} from '@vyrnforge/angular/tabs';
import '@vyrnforge/web/styles/tabs.css';

@Component({
  selector: 'vf-tabs-example',
  standalone: true,
  imports: [VfTabsRootDirective, VfTabsListDirective, VfTabsTabDirective, VfTabsPanelDirective],
  template: `
    <div vfTabsRoot id="example-tabs" defaultValue="overview">
      <div vfTabsList aria-label="Account sections">
        <button vfTabsTab="overview">Overview</button>
        <button vfTabsTab="billing" disabled>Billing</button>
        <button vfTabsTab="security">Security</button>
      </div>
      <div vfTabsPanel="overview">Overview content</div>
      <div vfTabsPanel="billing">Billing content</div>
      <div vfTabsPanel="security">Security content</div>
    </div>
  `,
})
class TabsExample {}

bootstrapApplication(TabsExample, { providers: [provideZonelessChangeDetection()] });
