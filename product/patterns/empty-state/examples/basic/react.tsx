import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

function Example() {
  const [created, setCreated] = useState(false);
  return (
    <Flow as="section" aria-labelledby="empty-title" gap="sm" align="center">
      <Text as="h2" id="empty-title" variant="heading-sm">
        {created ? 'Report created' : 'No saved reports'}
      </Text>
      <Text as="p">{created ? 'Example report is available.' : 'Create a report to see it here.'}</Text>
      {!created && (
        <Button type="button" onClick={() => setCreated(true)}>
          Create report
        </Button>
      )}
      <p role="status">{created ? 'Example report created' : ''}</p>
    </Flow>
  );
}

const mount = document.querySelector('#root');
if (!mount) throw new Error('Example mount is missing.');
createRoot(mount).render(<Example />);
