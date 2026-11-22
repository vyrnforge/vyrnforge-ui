import { createRoot } from 'react-dom/client';
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';

function App() {
  return <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
    <Badge badgeContent={12} size="sm">
      <button type="button" aria-label="Inbox, 12 unread messages">Inbox</button>
    </Badge>
    <Badge badgeContent={120} max={99} tone="accent">
      <button type="button" aria-label="Inbox, 120 unread messages">Mail</button>
    </Badge>
    <Badge badgeContent={1000} max={999} tone="danger">
      <button type="button" aria-label="Inbox, 1,000 unread messages">Priority</button>
    </Badge>
  </div>;
}
createRoot(document.querySelector('#root')!).render(<App />);
