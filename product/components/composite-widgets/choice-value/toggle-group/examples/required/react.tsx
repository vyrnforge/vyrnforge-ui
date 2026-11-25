import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleGroupRoot, ToggleGroupItem } from '@vyrnforge/react/toggle-group';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-group.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [value, setValue] = useState('list');
  function acceptSelection(next: string | string[]) {
    if (typeof next === 'string' && next) setValue(next);
  }
  return (
    <Flow gap="sm">
      <Flow direction="inline" wrap="wrap">
        <ToggleGroupRoot type="single" value={value} aria-label="Required view mode" onValueChange={acceptSelection}>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
          <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
        </ToggleGroupRoot>
      </Flow>
      <Text as="p" role="status">{`Current view: ${value}`}</Text>
    </Flow>
  );
}
const root = document.getElementById('root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
