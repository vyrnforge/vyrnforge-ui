import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';
import { useRef, useState } from 'react';
import { Button } from '@vyrnforge/react/button';
import { Icon } from '@vyrnforge/react/icon';
import { trashIcon } from '@vyrnforge/icons/trash';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/icon.css';
function App() {
  const [designVisible, setDesignVisible] = useState(true);
  const [draftVisible, setDraftVisible] = useState(true);
  const [clicks, setClicks] = useState(0);
  const restoreRef = useRef<HTMLButtonElement>(null);
  return <Flow gap="sm">
    <Flow direction="inline" wrap="wrap" gap="sm">
      {designVisible && <Chip onClick={() => setClicks(n => n + 1)}
        onRemove={() => { setDesignVisible(false); restoreRef.current?.focus(); }} removeLabel="Remove Design">Design</Chip>}
      {draftVisible && <Chip onRemove={() => { setDraftVisible(false); restoreRef.current?.focus(); }}
        removeLabel="Remove Draft" removeIcon={<Icon icon={trashIcon} size="sm" />}>Draft</Chip>}
      <Button ref={restoreRef} variant="secondary" type="button" onClick={() => { setDesignVisible(true); setDraftVisible(true); }}>Restore chips</Button>
    </Flow>
    <Text role="status">Design activations: {clicks}</Text>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
