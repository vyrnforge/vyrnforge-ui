import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleGroupRoot, ToggleGroupItem } from '@vyrnforge/react/toggle-group';
import { Icon } from '@vyrnforge/react/icon';
import { listIcon } from '@vyrnforge/icons/list';
import { gridIcon } from '@vyrnforge/icons/grid';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-group.css';
import '@vyrnforge/web/styles/icon.css';
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
          <ToggleGroupItem value="list" data-vf-icon-only="" aria-label="List view">
            <Icon icon={listIcon} />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" data-vf-icon-only="" aria-label="Grid view">
            <Icon icon={gridIcon} />
          </ToggleGroupItem>
        </ToggleGroupRoot>
      </Flow>
      <Text as="p" role="status">{`Current view: ${value}`}</Text>
    </Flow>
  );
}
const root = document.getElementById('root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
