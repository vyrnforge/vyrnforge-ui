import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import { heartIcon } from '@vyrnforge/icons/heart';
import { pinIcon } from '@vyrnforge/icons/pin';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { tokens } from '@vyrnforge/react';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [bookmarked, setBookmarked] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [pinned, setPinned] = useState(false);

  return (
    <Flow gap="sm" style={{ border: '1px solid ' + tokens.color.border, padding: tokens.space.md }}>
      <Text as="p" variant="title-md">Getting started with VyrnForge</Text>
      <Flow direction="inline" gap="xs" align="center">
        <ToggleButton iconOnly aria-label="Bookmark article" title="Bookmark article" onPressedChange={setBookmarked}>
          <Icon icon={bookmarkIcon} variant={bookmarked ? 'filled' : 'outlined'} />
        </ToggleButton>
        <ToggleButton iconOnly aria-label="Favorite article" title="Favorite article" onPressedChange={setFavorite}>
          <Icon icon={heartIcon} variant={favorite ? 'filled' : 'outlined'} />
        </ToggleButton>
        <ToggleButton iconOnly aria-label="Pin article" title="Pin article" onPressedChange={setPinned}>
          <Icon icon={pinIcon} variant={pinned ? 'filled' : 'outlined'} />
        </ToggleButton>
      </Flow>
      <Text as="p" role="status" tone="secondary">
        {[
          bookmarked && 'Bookmarked',
          favorite && 'Favorited',
          pinned && 'Pinned',
        ].filter(Boolean).join(' · ') || 'No article actions selected'}
      </Text>
    </Flow>
  );
}

const root = document.querySelector('#root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
