import { createRoot } from 'react-dom/client';
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';

function App() {
  return <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
    <Badge badgeContent={0}>
      <button type="button" aria-label="Inbox, no unread messages">Hidden zero</button>
    </Badge>
    <Badge badgeContent={0} showZero tone="accent">
      <button type="button" aria-label="Inbox, zero unread messages">Shown zero</button>
    </Badge>
    <Badge badgeContent={7} invisible>
      <button type="button" aria-label="Inbox, 7 unread messages">Invisible indicator</button>
    </Badge>
  </div>;
}
createRoot(document.querySelector('#root')!).render(<App />);
