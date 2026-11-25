import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return <Flow direction="inline" wrap="wrap" gap="sm" align="center">
    <Chip>Draft</Chip><Chip tone="accent">New</Chip><Chip tone="danger">Blocked</Chip>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
