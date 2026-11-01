import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';

function App() {
  return (
    <div className="vf-example-stack">
      <Button variant="primary" type="button">Primary</Button>
      <Button variant="secondary" type="button">Secondary</Button>
      <Button variant="ghost" type="button">Ghost</Button>
    </div>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
