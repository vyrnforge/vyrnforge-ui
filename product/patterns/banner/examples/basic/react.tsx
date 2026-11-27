import { Text } from '@vyrnforge/react/text';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Alert } from '@vyrnforge/react/alert';
import { Link } from '@vyrnforge/react/link';

function Example() {
  return (
    <section aria-label="Service information">
      <Alert
        severity="warning"
        heading="Scheduled maintenance"
        actions={<Link href="#maintenance">Details</Link>}
      >
        Transfers will be unavailable during maintenance.
      </Alert>
      <Text as="p" id="maintenance">Maintenance details remain available in the service information section.</Text>
    </section>
  );
}

const mount = document.querySelector('#root');
if (!mount) throw new Error('Example mount is missing.');
createRoot(mount).render(<Example />);
