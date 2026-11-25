import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  return (
    <Flow direction="inline" align="center" wrap="wrap" gap="md">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ToggleButton key={size} size={size} iconOnly aria-label={'Bookmark (' + size + ')'}>
          <Icon icon={bookmarkIcon} size={size} />
        </ToggleButton>
      ))}
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
