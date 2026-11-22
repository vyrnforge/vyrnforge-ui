import { createRoot } from 'react-dom/client';
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';

function App() {
  return <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
    <Badge badgeContent={4} tone="accent">
      <button type="button" aria-label="Inbox, 4 unread messages">Inbox</button>
    </Badge>
    <Badge badgeContent="NEW">
      <button type="button" aria-label="Files, new upload available">Files</button>
    </Badge>
  </div>;
}
createRoot(document.querySelector('#root')!).render(<App />);
