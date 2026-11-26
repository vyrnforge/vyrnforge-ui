import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';
import { useState } from 'react';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [count, setCount] = useState(0);
  const activate = () => setCount(count + 1);
  return <Flow gap="sm" align="center">
    <Flow direction="inline" wrap="wrap" gap="sm" justify="center">
      <Chip onClick={activate}>Clickable</Chip><Chip variant="outlined" onClick={activate}>Clickable</Chip>
    </Flow>
    <Text role="status" variant="body-sm">Activations: {count}</Text>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
