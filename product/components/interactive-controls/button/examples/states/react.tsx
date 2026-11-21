import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Button } from '@vyrnforge/react/button';

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="md" align="center">
      <Button type="button">Ready</Button>
      <Button variant="secondary" disabled type="button">Disabled</Button>
      <Button loading type="button">Loading</Button>
      <Button loading disabled type="button">Loading and disabled</Button>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
