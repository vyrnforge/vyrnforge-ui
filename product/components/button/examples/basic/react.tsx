import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';

function App() {
  return (
    <div className="vf-example-stack">
      <Button variant="primary">Save changes</Button>
      <Button variant="secondary">Preview</Button>
      <Button variant="ghost">Cancel</Button>
    </div>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
