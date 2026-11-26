import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return <Flow gap="sm" align="center">
    <Flow direction="inline" wrap="wrap" gap="sm" align="center" justify="center">
      <Chip size="sm">Small</Chip><Chip>Medium</Chip><Chip size="lg">Large</Chip>
    </Flow>
    <Flow direction="inline" wrap="wrap" gap="sm" align="center" justify="center">
      <Chip size="sm" variant="outlined">Small</Chip><Chip variant="outlined">Medium</Chip><Chip size="lg" variant="outlined">Large</Chip>
    </Flow>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
