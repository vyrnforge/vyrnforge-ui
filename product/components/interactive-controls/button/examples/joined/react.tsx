import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [action, setAction] = useState('No action yet');
  return (
    <Flow as="section" gap="lg" aria-label="Button grouping patterns">
      <Text as="h2" variant="heading-sm">Separate actions</Text>
      <Flow direction="inline" wrap="wrap" gap="sm">
        <Button type="button" onClick={() => setAction('Saved')}>Save</Button>
        <Button type="button" variant="secondary" onClick={() => setAction('Previewed')}>Preview</Button>
        <Button type="button" variant="ghost" onClick={() => setAction('Cancelled')}>Cancel</Button>
      </Flow>
      <Text as="h2" variant="heading-sm">Joined actions</Text>
      <Flow direction="inline" gap="none" role="group" aria-label="Document actions"
        data-vf-button-group="">
        <Button type="button" variant="secondary" onClick={() => setAction('Edited')}>Edit</Button>
        <Button type="button" variant="secondary" onClick={() => setAction('Copied')}>Copy</Button>
        <Button type="button" variant="secondary" disabled>Archive</Button>
      </Flow>
      <Text as="h2" variant="heading-sm">Vertical joined actions</Text>
      <Flow direction="block" gap="none" role="group" aria-label="View actions"
        data-vf-button-group="" data-vf-button-group-orientation="vertical">
        <Button type="button" variant="secondary" onClick={() => setAction('Detailed view')}>Details</Button>
        <Button type="button" variant="secondary" onClick={() => setAction('Summary view')}>Summary</Button>
      </Flow>
      <Text as="p" role="status">{action}</Text>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
