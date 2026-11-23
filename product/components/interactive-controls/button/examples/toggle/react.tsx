import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { pinIcon } from '@vyrnforge/icons/pin';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [bold, setBold] = useState(false);
  const [pinned, setPinned] = useState(false);
  return (
    <Flow as="section" gap="md" aria-label="Toggle Button examples">
      <Text as="h2" variant="heading-sm">Independent text toggles</Text>
      <Flow direction="inline" wrap="wrap" gap="sm">
        <ToggleButton type="button" size="sm" pressed={bold}
          onPressedChange={setBold}>Bold</ToggleButton>
        <ToggleButton size="md" defaultPressed>Italic</ToggleButton>
        <ToggleButton size="lg">Underline</ToggleButton>
      </Flow>
      <Text as="h2" variant="heading-sm">Square icon-only toggles</Text>
      <Flow direction="inline" wrap="wrap" gap="sm" align="center">
        <ToggleButton type="button" iconOnly pressed={pinned} aria-label="Pin document"
          onPressedChange={setPinned}>
          <Icon icon={pinIcon} />
        </ToggleButton>
        <ToggleButton type="button" iconOnly defaultPressed aria-label="Bookmark document">
          <Icon icon={bookmarkIcon} />
        </ToggleButton>
      </Flow>
      <Text as="p" role="status">Bold: {bold ? 'on' : 'off'}</Text>
      <Text as="p">Pin document: {pinned ? 'on' : 'off'}</Text>
      <Button type="button" variant="ghost" onClick={() => setBold(false)}>Clear Bold</Button>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
