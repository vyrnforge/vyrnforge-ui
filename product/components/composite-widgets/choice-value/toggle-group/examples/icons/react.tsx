import { createRoot } from 'react-dom/client';
import { ToggleGroupRoot, ToggleGroupItem } from '@vyrnforge/react/toggle-group';
import { Icon } from '@vyrnforge/react/icon';
import { listIcon } from '@vyrnforge/icons/list';
import { gridIcon } from '@vyrnforge/icons/grid';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/toggle-group.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="sm">
      <ToggleGroupRoot type="single" defaultValue="list" aria-label="View mode">
        <ToggleGroupItem value="list" data-vf-icon-only="" aria-label="List view">
          <Icon icon={listIcon} />
        </ToggleGroupItem>
        <ToggleGroupItem value="grid" data-vf-icon-only="" aria-label="Grid view">
          <Icon icon={gridIcon} />
        </ToggleGroupItem>
      </ToggleGroupRoot>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
