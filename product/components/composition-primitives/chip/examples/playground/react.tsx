import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';
import { useRef, useState } from 'react';
import { Button } from '@vyrnforge/react/button';
import { Motion } from '@vyrnforge/react';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/foundation.css';
function App() {
  const restoreRef = useRef<HTMLButtonElement>(null);
  const [outlined, setOutlined] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  return <Flow gap="md">
    <Flow direction="inline" wrap="wrap" gap="sm">
      <Button type="button" variant="secondary" onClick={() => setOutlined(!outlined)}>Variant: {outlined ? 'outlined' : 'filled'}</Button>
      <Button type="button" variant="secondary" onClick={() => setSize(size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'sm')}>Size: {size}</Button>
      <Button type="button" variant="secondary" onClick={() => setDisabled(!disabled)}>{disabled ? 'Enable' : 'Disable'}</Button>
      <Button ref={restoreRef} type="button" variant="secondary" onClick={() => setVisible(true)}>Restore</Button>
    </Flow>
    {visible && <Motion as="span" effect="grow">
      <Chip selectable size={size} variant={outlined ? 'outlined' : 'filled'} disabled={disabled}
        onRemove={() => { setVisible(false); restoreRef.current?.focus(); }} removeLabel="Remove Preview">Preview</Chip>
    </Motion>}
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
