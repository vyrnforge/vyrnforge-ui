import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return <Flow gap="sm" align="center">
    <Flow direction="inline" wrap="wrap" align="center" justify="center" gap="sm">
      <Chip>Neutral</Chip><Chip tone="accent">Accent</Chip><Chip tone="danger">Danger</Chip>
    </Flow>
    <Flow direction="inline" wrap="wrap" align="center" justify="center" gap="sm">
      <Chip variant="outlined">Neutral</Chip><Chip variant="outlined" tone="accent">Accent</Chip><Chip variant="outlined" tone="danger">Danger</Chip>
    </Flow>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
