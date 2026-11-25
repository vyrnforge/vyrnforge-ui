import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { pinIcon } from '@vyrnforge/icons/pin';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  return (
    <Flow direction="inline" gap="sm">
      <ToggleButton>
        <Icon icon={pinIcon} /> Pin document
      </ToggleButton>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
