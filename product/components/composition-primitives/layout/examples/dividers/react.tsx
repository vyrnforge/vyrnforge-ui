import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/layout.css';

export function NativeDividersExample() {
  return (
    <Flow as="article" gap="md">
      <Flow as="section" gap="xs" aria-labelledby="profile-title">
        <Text as="h3" variant="heading-sm" id="profile-title">Profile</Text>
        <Text as="p">Contact details and account identity.</Text>
      </Flow>
      {/* Native hr already conveys a thematic break; CSS is optional. */}
      <hr />
      <Flow as="section" gap="xs" aria-labelledby="preferences-title">
        <Text as="h3" variant="heading-sm" id="preferences-title">Preferences</Text>
        <Text as="p">Notifications and display settings.</Text>
      </Flow>
    </Flow>
  );
}
