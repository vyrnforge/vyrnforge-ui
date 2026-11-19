import '@vyrnforge/web/styles/layout.css';

export function AccountOverview() {
  return (
    <main style={{ maxInlineSize: '64rem', marginInline: 'auto', paddingInline: 'var(--vf-space-md)' }}>
      <section data-vf-flow data-vf-flow-direction="block" data-vf-flow-gap="lg" aria-labelledby="account-heading">
        <header data-vf-flow data-vf-flow-gap="xs"><h2 id="account-heading">Account overview</h2><p>Review workspace details and recent activity.</p></header>
        <div data-vf-auto-grid data-vf-auto-grid-gap="md">
          <article>Profile settings</article><article>Team access</article><article>Recent activity</article>
        </div>
        <div data-vf-flow data-vf-flow-direction="inline" data-vf-flow-wrap="wrap" data-vf-flow-gap="sm" data-vf-flow-align="center">
          <button type="button">Edit profile</button><button type="button">Manage team</button>
        </div>
      </section>
    </main>
  );
}
