import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';
import { Icon } from '@vyrnforge/react/icon';
import { tagIcon } from '@vyrnforge/icons/tag';
import { chevronRightIcon } from '@vyrnforge/icons/chevron-right';
import '@vyrnforge/web/styles/icon.css';

function App() {
  return <Flow direction="inline" wrap="wrap" gap="sm" align="center" justify="center">
    <Chip leading={<Icon icon={tagIcon} size="sm" />}>Category</Chip>
    <Chip variant="outlined" leading={<Icon icon={tagIcon} size="sm" />}>Category</Chip>
    <Chip trailing={<Icon icon={chevronRightIcon} size="sm" />}>Details</Chip>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
