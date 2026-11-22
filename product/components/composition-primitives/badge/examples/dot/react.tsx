import { createRoot } from 'react-dom/client';
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';

function App() {
  return <div>
    <Badge appearance="dot" tone="accent" label="Sync in progress" />
    <span><Badge appearance="dot" decorative />Available</span>
    <Badge appearance="dot" tone="danger" label="Action required" />
  </div>;
}
createRoot(document.querySelector('#root')!).render(<App />);
