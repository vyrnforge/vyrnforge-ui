import { createRoot } from 'react-dom/client';
import { Badge } from '@vyrnforge/react/badge';
import '@vyrnforge/web/styles/badge.css';

function App() {
  return <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
    <Badge tone="neutral" size="sm">Neutral</Badge>
    <Badge tone="accent" size="sm" shape="rounded">Accent</Badge>
    <Badge tone="danger" variant="outline" shape="rounded">Requires review</Badge>
    <Badge tone="accent" variant="outline">Outline</Badge>
  </div>;
}
createRoot(document.querySelector('#root')!).render(<App />);
