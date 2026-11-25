import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { pinIcon } from '@vyrnforge/icons/pin';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [pinned, setPinned] = useState(false);
  return (
    <Flow gap="md">
      <Flow direction="inline" wrap="wrap" gap="sm" align="center">
        <ToggleButton type="button" iconOnly pressed={pinned} aria-label="Pin document"
          onPressedChange={setPinned}>
          <Icon icon={pinIcon} />
        </ToggleButton>
        <ToggleButton type="button" iconOnly defaultPressed aria-label="Bookmark document">
          <Icon icon={bookmarkIcon} />
        </ToggleButton>
      </Flow>
      <Text as="p" role="status">Pin document: {pinned ? 'on' : 'off'}</Text>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
