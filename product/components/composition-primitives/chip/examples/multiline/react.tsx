import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return <Flow gap="sm" align="center">
    <Flow as="section" aria-label="Constrained chip examples" gap="sm" style={{ maxInlineSize: '13rem' }}>
      <Chip>Long internationalized category label</Chip>
      <Chip wrap>Long internationalized category label</Chip>
    </Flow>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
