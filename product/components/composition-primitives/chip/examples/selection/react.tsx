import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';
import { useState } from 'react';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/text.css';
function App() {
  const [selected, setSelected] = useState(false);
  const [count, setCount] = useState(0);
  return <Flow gap="sm">
    <Flow direction="inline" wrap="wrap" gap="sm">
      <Chip onClick={() => setCount(count + 1)}>Refresh</Chip>
      <Chip selectable defaultSelected>Open</Chip>
      <Chip selectable selected={selected} onSelectedChange={setSelected}>Assigned to me</Chip>
      <Chip selectable disabled>Unavailable</Chip>
    </Flow>
    <Text>Refreshes: {count}; Assigned filter: {selected ? 'on' : 'off'}</Text>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
