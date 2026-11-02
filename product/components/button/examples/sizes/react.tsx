import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';

function App() {
  return (
    <div className="vf-example-stack">
      <Button size="sm" type="button">Small</Button>
      <Button size="md" type="button">Medium</Button>
      <Button size="lg" type="button">Large</Button>
    </div>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
