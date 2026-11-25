import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return (
    <Flow gap="md">
      <Flow direction="inline" align="center" wrap="wrap" gap="sm">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ToggleButton key={size} size={size} aria-label={'Show archived (' + size + ')'}>
            Show archived
          </ToggleButton>
        ))}
      </Flow>
      <Flow direction="inline" align="center" wrap="wrap" gap="sm">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ToggleButton key={size} size={size} iconOnly aria-label={'Bookmark (' + size + ')'}>
            <Icon icon={bookmarkIcon} size={size} />
          </ToggleButton>
        ))}
      </Flow>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
