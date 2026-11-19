import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/layout.css';

export function AccountOverview() {
  return (
    <main style={{ maxInlineSize: '64rem', marginInline: 'auto', paddingInline: 'var(--vf-space-md)' }}>
      <Flow as="section" gap="lg" aria-labelledby="account-heading">
        <Flow as="header" gap="xs">
          <h2 id="account-heading">Account overview</h2>
          <p>Review workspace details and recent activity.</p>
        </Flow>
        <AutoGrid gap="md">
          <article>Profile settings</article>
          <article>Team access</article>
          <article>Recent activity</article>
        </AutoGrid>
        <Flow direction="inline" wrap="wrap" gap="sm" align="center">
          <button type="button">Edit profile</button>
          <button type="button">Manage team</button>
        </Flow>
      </Flow>
    </main>
  );
}
