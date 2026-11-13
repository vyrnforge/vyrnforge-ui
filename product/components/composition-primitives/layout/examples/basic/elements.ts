import '@vyrnforge/web/styles/layout.css';

document.querySelector('#root')!.innerHTML = `
  <main data-vf-container data-vf-container-size="lg" data-vf-container-gutter="md">
    <section data-vf-stack data-vf-stack-gap="lg">
      <header>
        <h2>Account overview</h2>
        <p>Review workspace details and recent activity.</p>
      </header>
      <div data-vf-auto-grid data-vf-auto-grid-gap="md">
        <article>Profile settings</article>
        <article>Team access</article>
        <article>Recent activity</article>
      </div>
      <div data-vf-cluster data-vf-cluster-gap="sm" data-vf-cluster-align="center">
        <button type="button">Edit profile</button>
        <button type="button">Manage team</button>
      </div>
    </section>
  </main>
`;
