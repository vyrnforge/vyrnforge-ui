import { createRoot } from 'react-dom/client';
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';

function App() {
  return <div style={{ display: 'flex', gap: '1.5rem', padding: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
    <Badge badgeContent={1} anchorOrigin={{ vertical: 'top', horizontal: 'start' }}>
      <button type="button" aria-label="Start, one update">Start</button>
    </Badge>
    <Badge badgeContent={2} anchorOrigin={{ vertical: 'bottom', horizontal: 'end' }} tone="accent">
      <button type="button" aria-label="End, two updates">End</button>
    </Badge>
    <Badge variant="dot" overlap="circular" tone="accent" anchorOrigin={{ vertical: 'bottom', horizontal: 'end' }}>
      <span role="img" aria-label="Profile, active" style={{ display: 'grid', placeItems: 'center', borderRadius: '50%', width: '3rem', height: '3rem', border: '1px solid currentColor' }}>AB</span>
    </Badge>
  </div>;
}
createRoot(document.querySelector('#root')!).render(<App />);
