import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';
import { useState, useRef } from 'react';
import { Button } from '@vyrnforge/react/button';
import '@vyrnforge/web/styles/button.css';

function App() {
  const [items, setItems] = useState(['filled', 'outlined'] as const as readonly string[]);
  const reset = useRef<HTMLButtonElement>(null);
  return <Flow gap="sm" align="center">
    <Flow direction="inline" wrap="wrap" gap="sm" justify="center">
      {items.map(item => <Chip key={item} variant={item === 'filled' ? 'filled' : 'outlined'}
        removeLabel={'Remove ' + item} onRemove={() => { setItems(items.filter(value => value !== item)); reset.current?.focus(); }}>Deletable</Chip>)}
    </Flow>
    <Button ref={reset} variant="secondary" type="button" onClick={() => setItems(['filled', 'outlined'])}>Reset</Button>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
