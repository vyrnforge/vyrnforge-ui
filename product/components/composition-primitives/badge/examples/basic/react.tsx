import { createRoot } from 'react-dom/client';
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';

function App() {
  return <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
    <Badge>Draft</Badge>
    <Badge tone="accent">New</Badge>
    <Badge>12</Badge>
    <Badge tone="danger" variant="outline">Blocked</Badge>
  </div>;
}
createRoot(document.querySelector('#root')!).render(<App />);
