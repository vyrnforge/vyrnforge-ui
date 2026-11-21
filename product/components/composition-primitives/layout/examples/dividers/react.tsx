import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/layout.css';

export function NativeDividersExample() {
  return (
    <Flow as="article" gap="md">
      <section aria-labelledby="profile-title">
        <h3 id="profile-title">Profile</h3>
        <p>Contact details and account identity.</p>
      </section>
      {/* Native hr already conveys a thematic break; CSS is optional. */}
      <hr />
      <section aria-labelledby="preferences-title">
        <h3 id="preferences-title">Preferences</h3>
        <p>Notifications and display settings.</p>
      </section>
    </Flow>
  );
}
