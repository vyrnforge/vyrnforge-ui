import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [bold, setBold] = useState(false);
  return (
    <Flow as="section" gap="md" aria-label="Toggle Button examples">
      <Text as="h2" variant="heading-sm">Controlled pressed state</Text>
      <Flow direction="inline" wrap="wrap" gap="sm">
        <ToggleButton type="button" size="sm" pressed={bold}
          onPressedChange={setBold}>Bold</ToggleButton>
        <ToggleButton size="md" defaultPressed>Italic</ToggleButton>
        <ToggleButton size="lg">Underline</ToggleButton>
      </Flow>
      <Text as="p" role="status">Bold: {bold ? 'on' : 'off'}</Text>
      <Button type="button" variant="ghost" onClick={() => setBold(false)}>Clear Bold</Button>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
