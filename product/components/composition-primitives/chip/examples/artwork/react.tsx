import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';
import { Avatar } from '@vyrnforge/react/avatar';
import '@vyrnforge/web/styles/avatar.css';

function App() {
  return <Flow direction="inline" wrap="wrap" gap="sm" align="center" justify="center">
    <Chip leading={<Avatar name="Alex Morgan" decorative size="sm" />}>Alex</Chip>
    <Chip variant="outlined" leading={<Avatar name="Sam Lee" decorative size="sm" />}>Sam</Chip>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
