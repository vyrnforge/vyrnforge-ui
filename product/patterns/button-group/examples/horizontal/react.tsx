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
      <Flow direction="inline" gap="none" role="group" aria-label="Document actions"
        data-vf-button-group="">
        <Button type="button" variant="secondary" onClick={() => setAction('Edited')}>Edit</Button>
        <Button type="button" variant="secondary" onClick={() => setAction('Copied')}>Copy</Button>
        <Button type="button" variant="secondary" disabled>Archive</Button>
      </Flow>
      <Text as="p" role="status">{action}</Text>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
