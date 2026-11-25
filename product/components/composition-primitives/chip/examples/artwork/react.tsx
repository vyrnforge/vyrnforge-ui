import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';
import { Icon } from '@vyrnforge/react/icon';
import { Avatar } from '@vyrnforge/react/avatar';
import { checkIcon } from '@vyrnforge/icons/check';
import { chevronRightIcon } from '@vyrnforge/icons/chevron-right';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/avatar.css';
function App() {
  return <Flow direction="inline" wrap="wrap" gap="sm" align="center">
    <Chip leading={<Icon icon={checkIcon} size="sm" />} tone="accent">Reviewed</Chip>
    <Chip leading={<Avatar name="Ada Lovelace" size="sm" decorative />}>Ada Lovelace</Chip>
    <Chip trailing={<Icon icon={chevronRightIcon} size="sm" />} onClick={() => {}}>Details</Chip>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
