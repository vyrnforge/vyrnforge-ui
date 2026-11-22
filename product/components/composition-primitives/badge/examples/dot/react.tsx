import { createRoot } from 'react-dom/client';
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';

function App() {
  return <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
    <Badge variant="dot" tone="danger">
      <button type="button" aria-label="Notifications, new items">Alerts</button>
    </Badge>
    <Badge variant="dot" tone="accent">
      <span>Sync in progress</span>
    </Badge>
  </div>;
}
createRoot(document.querySelector('#root')!).render(<App />);
