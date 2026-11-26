import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return <Flow gap="md">
    <Flow direction="inline" wrap="wrap" gap="sm" align="center">
      <Chip size="sm">Small</Chip><Chip>Medium</Chip><Chip size="lg">Large</Chip>
    </Flow>
    <Flow direction="inline" wrap="wrap" gap="sm">
      {(['neutral', 'accent', 'danger'] as const).map(tone => <Chip key={tone} tone={tone}>{tone}</Chip>)}
      {(['neutral', 'accent', 'danger'] as const).map(tone => <Chip key={tone} tone={tone} variant="outlined">{tone}</Chip>)}
    </Flow>
    <Chip variant="outlined">Outlined label</Chip>
    <Chip wrap>Internationalized category with a very long descriptive name that may wrap on narrow screens</Chip>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
