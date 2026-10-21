import { defineLayoutElements } from '@vyrnforge/elements/layout';

defineLayoutElements();

document.querySelector('#root')!.innerHTML = `
  <vf-container size="lg" gutter="md">
    <vf-stack gap="lg">
      <header>
        <h2>Account overview</h2>
        <p>Review workspace details and recent activity.</p>
      </header>
      <vf-grid gap="md">
        <article>Profile settings</article>
        <article>Team access</article>
        <article>Recent activity</article>
      </vf-grid>
      <vf-cluster gap="sm" align="center">
        <button type="button">Edit profile</button>
        <button type="button">Manage team</button>
      </vf-cluster>
    </vf-stack>
  </vf-container>
`;
