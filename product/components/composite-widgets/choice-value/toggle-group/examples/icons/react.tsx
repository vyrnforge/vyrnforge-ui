import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleGroupRoot, ToggleGroupItem } from '@vyrnforge/react/toggle-group';
import { Icon } from '@vyrnforge/react/icon';
import { listIcon } from '@vyrnforge/icons/list';
import { gridIcon } from '@vyrnforge/icons/grid';
import { AutoGrid, Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { tokens } from '@vyrnforge/react';
import '@vyrnforge/web/styles/toggle-group.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [view, setView] = useState('list');
  return (
    <Flow gap="md">
      <Flow direction="inline">
        <ToggleGroupRoot
          type="single"
          defaultValue="list"
          aria-label="Project view"
          onValueChange={(next) => {
            if (typeof next === 'string') setView(next);
          }}
        >
          <ToggleGroupItem value="list" data-vf-icon-only="" aria-label="List view" title="List view">
            <Icon icon={listIcon} />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" data-vf-icon-only="" aria-label="Grid view" title="Grid view">
            <Icon icon={gridIcon} />
          </ToggleGroupItem>
        </ToggleGroupRoot>
      </Flow>
      {view === 'grid' ? (
        <AutoGrid as="ul" minItemSize="7rem" gap="sm" data-example-preview="view" aria-label="Sample projects">
          {['Website', 'Mobile app', 'Design system'].map((project) => (
            <li key={project} style={{ border: '1px solid ' + tokens.color.border, padding: tokens.space.sm }}>
              <Text as="span">{project}</Text>
            </li>
          ))}
        </AutoGrid>
      ) : (
        <Flow as="ul" gap="sm" data-example-preview="view" aria-label="Sample projects">
          {['Website', 'Mobile app', 'Design system'].map((project) => (
            <li key={project} style={{ border: '1px solid ' + tokens.color.border, padding: tokens.space.sm }}>
              <Text as="span">{project}</Text>
            </li>
          ))}
        </Flow>
      )}
    </Flow>
  );
}
const root = document.querySelector('#root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
