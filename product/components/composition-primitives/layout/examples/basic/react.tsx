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
          <Text as="article">Profile settings</Text>
          <Text as="article">Team access</Text>
          <Text as="article">Recent activity</Text>
        </AutoGrid>
        <Flow direction="inline" wrap="wrap" gap="sm" align="center">
          <Button type="button">Edit profile</Button>
          <Button type="button">Manage team</Button>
        </Flow>
      </Flow>
    </main>
  );
}
