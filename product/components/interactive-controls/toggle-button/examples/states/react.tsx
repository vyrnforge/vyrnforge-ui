import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { tokens } from '@vyrnforge/react';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

const documents = [
  { name: 'Report', saved: false, locked: false },
  { name: 'Notes', saved: true, locked: false },
  { name: 'Invoice', saved: false, locked: true },
  { name: 'Draft', saved: true, locked: true },
];

function App() {
  const [items, setItems] = useState(documents);
  return (
    <Flow gap="xs">
      {items.map((item) => (
        <Flow key={item.name} direction="inline" gap="sm" align="center"
          style={{ border: '1px solid ' + tokens.color.border, padding: tokens.space.xs }}>
          <ToggleButton iconOnly aria-label={'Bookmark ' + item.name} pressed={item.saved} disabled={item.locked}
            onPressedChange={(saved) => setItems((previous) => previous.map((entry) =>
              entry.name === item.name ? { ...entry, saved } : entry))}>
            <Icon icon={bookmarkIcon} variant={item.saved ? 'filled' : 'outlined'} />
          </ToggleButton>
          <Text as="p">{item.name} — {item.saved ? 'Saved' : 'Not saved'}{item.locked ? ' (read-only)' : ''}</Text>
        </Flow>
      ))}
    </Flow>
  );
}

const root = document.querySelector('#root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
