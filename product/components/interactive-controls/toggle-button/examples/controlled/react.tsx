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
  const [bold, setBold] = useState(false);
  return (
    <Flow gap="md">
      <Flow direction="inline" wrap="wrap" gap="sm">
        <ToggleButton pressed={bold} onPressedChange={setBold}>Bold</ToggleButton>
        <ToggleButton defaultPressed>Italic</ToggleButton>
      </Flow>
      <Text as="p" role="status">Bold is {bold ? 'on' : 'off'}</Text>
      <Flow direction="inline">
        <Button variant="ghost" onClick={() => setBold(false)}>Reset Bold</Button>
      </Flow>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
