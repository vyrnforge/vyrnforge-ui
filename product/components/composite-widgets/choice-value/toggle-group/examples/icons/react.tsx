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
  const [view, setView] = useState('list');
  return (
    <Flow gap="md">
      <Flow direction="inline">
        <ToggleGroupRoot type="single" defaultValue="list" aria-label="Workbook view"
          onValueChange={(next) => { if (typeof next === 'string') setView(next); }}>
          <ToggleGroupItem value="list" data-vf-icon-only="" aria-label="List view" title="List view">
            <Icon icon={listIcon} />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" data-vf-icon-only="" aria-label="Grid view" title="Grid view">
            <Icon icon={gridIcon} />
          </ToggleGroupItem>
        </ToggleGroupRoot>
      </Flow>
      <Flow as="ul" direction={view === 'grid' ? 'inline' : 'block'} wrap="wrap" gap="sm"
        data-example-preview="view" aria-label="Sample workbook sheets">
        {['Revenue', 'Expenses', 'Summary'].map((sheet) => (
          <li key={sheet}><Text as="span">{sheet}</Text></li>
        ))}
      </Flow>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
