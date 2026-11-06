import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';

function App() {
  return (
    <div className="vf-example-stack">
      <Button type="button">Ready</Button>
      <Button variant="secondary" disabled type="button">Disabled</Button>
      <Button loading type="button">Loading</Button>
      <Button loading disabled type="button">Loading and disabled</Button>
    </div>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
