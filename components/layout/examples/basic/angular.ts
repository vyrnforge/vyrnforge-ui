import { Component } from '@angular/core';
import { VfClusterDirective, VfContainerDirective, VfGridDirective, VfStackDirective } from '@vyrnforge/angular/layout';

@Component({
  selector: 'account-overview',
  standalone: true,
  imports: [VfClusterDirective, VfContainerDirective, VfGridDirective, VfStackDirective],
  template: `
    <main vfContainer vfContainerSize="lg" vfContainerGutter="md">
      <section vfStack vfStackGap="lg" aria-labelledby="account-heading">
        <header vfStack vfStackGap="xs">
          <h2 id="account-heading">Account overview</h2>
          <p>Review workspace details and recent activity.</p>
        </header>
        <div vfGrid vfGridGap="md" style="--vf-grid-min-item-size: 12rem">
          <article>Profile settings</article>
          <article>Team access</article>
          <article>Recent activity</article>
        </div>
        <div vfCluster vfClusterGap="sm" vfClusterAlign="center">
          <button type="button">Edit profile</button>
          <button type="button">Manage team</button>
        </div>
      </section>
    </main>
  `,
})
export class AccountOverview {}
