import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';
import { useRef, useState } from 'react';
import { Button } from '@vyrnforge/react/button';
import '@vyrnforge/web/styles/button.css';
function App() {
  const [visible, setVisible] = useState(true);
  const restoreRef = useRef<HTMLButtonElement>(null);
  return <Flow gap="md">
    <Flow direction="inline" wrap="wrap" gap="sm">
      <Chip href="#chip-destination" variant="outlined">Project details</Chip>
      {visible && <Chip href="#chip-destination" onRemove={() => { setVisible(false); restoreRef.current?.focus(); }}
        removeLabel="Remove Project link">Project link</Chip>}
      <Chip href="#chip-destination" disabled>Unavailable link</Chip>
      <Button ref={restoreRef} type="button" variant="secondary" onClick={() => setVisible(true)}>Restore link</Button>
    </Flow>
    <Text as="h3" variant="heading-sm" id="chip-destination">Project destination</Text>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
