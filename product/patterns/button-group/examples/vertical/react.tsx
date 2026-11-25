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
    <Flow gap="md">
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
