import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [archived, setArchived] = useState(false);
  return (
    <Flow gap="md">
      <Flow direction="inline" wrap="wrap" gap="sm">
        <ToggleButton pressed={archived} onPressedChange={setArchived}>Show archived</ToggleButton>
        <ToggleButton defaultPressed>Show completed</ToggleButton>
      </Flow>
      <Text as="p" role="status">Archived items: {archived ? 'on' : 'off'}</Text>
      <Flow direction="inline">
        <Button variant="ghost" onClick={() => setArchived(false)}>Reset archived filter</Button>
      </Flow>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
