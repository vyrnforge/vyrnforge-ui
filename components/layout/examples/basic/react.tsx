import { Cluster, Container, Grid, Stack } from '@vyrnforge/react/layout';

export function AccountOverview() {
  return (
    <Container as="main" size="lg" gutter="md">
      <Stack as="section" gap="lg" aria-labelledby="account-heading">
        <Stack as="header" gap="xs">
          <h2 id="account-heading">Account overview</h2>
          <p>Review workspace details and recent activity.</p>
        </Stack>
        <Grid gap="md" style={{ '--vf-grid-min-item-size': '12rem' } as React.CSSProperties}>
          <article>Profile settings</article>
          <article>Team access</article>
          <article>Recent activity</article>
        </Grid>
        <Cluster gap="sm" align="center">
          <button type="button">Edit profile</button>
          <button type="button">Manage team</button>
        </Cluster>
      </Stack>
    </Container>
  );
}
