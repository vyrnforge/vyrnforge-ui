import { Flow, AutoGrid } from '@vyrnforge/react/layout';
import { Button } from '@vyrnforge/react/button';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/layout.css';

export function AccountOverview() {
  return (
    <main>
      <Flow as="section" gap="lg" aria-labelledby="account-heading">
        <Flow as="header" gap="xs">
          <Text as="h2" variant="heading-md" id="account-heading">Account overview</Text>
          <Text as="p">Review workspace details and recent activity.</Text>
        </Flow>
        <AutoGrid gap="md">
          <article><Text as="p">Profile settings</Text></article>
          <article><Text as="p">Team access</Text></article>
          <article><Text as="p">Recent activity</Text></article>
        </AutoGrid>
        <Flow direction="inline" wrap="wrap" gap="sm" align="center">
          <Button type="button">Edit profile</Button>
          <Button type="button">Manage team</Button>
        </Flow>
      </Flow>
    </main>
  );
}
