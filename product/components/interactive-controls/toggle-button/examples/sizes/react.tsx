import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { tokens } from '@vyrnforge/react';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [saved, setSaved] = useState(false);
  return (
    <Flow gap="md">
      <Flow direction="inline" align="center" wrap="wrap" gap="sm" role="group" aria-label="Icon sizes">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ToggleButton key={size} size={size} iconOnly pressed={saved} onPressedChange={setSaved}
            aria-label={'Bookmark icon (' + size + ')'} title={'Bookmark (' + size + ')'}>
            <Icon icon={bookmarkIcon} size={size} variant={saved ? 'filled' : 'outlined'} />
          </ToggleButton>
        ))}
      </Flow>
      <Flow direction="inline" align="center" wrap="wrap" gap="sm" role="group" aria-label="Text sizes">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ToggleButton key={size} size={size} pressed={saved} onPressedChange={setSaved}
            aria-label={'Bookmark (' + size + ')'}>
            Bookmark
          </ToggleButton>
        ))}
      </Flow>
      <Text as="p" role="status" data-example-preview="size" style={{ color: tokens.color.muted }}>
        {saved ? 'Article bookmarked' : 'Article not bookmarked'}
      </Text>
    </Flow>
  );
}

const root = document.querySelector('#root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
