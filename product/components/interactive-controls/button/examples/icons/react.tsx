import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import { searchIcon } from '@vyrnforge/icons/search';
import { shareIcon } from '@vyrnforge/icons/share';
import { moreHorizontalIcon } from '@vyrnforge/icons/more-horizontal';
import { closeIcon } from '@vyrnforge/icons/close';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [lastAction, setLastAction] = useState('None');
  return (
    <Flow as="section" gap="md" aria-label="Icon-only and labeled Button examples">
      <Text as="h2" variant="heading-sm">Quiet icon-only actions</Text>
      <Flow direction="inline" wrap="wrap" align="center" gap="md">
        <Button type="button" iconOnly size="sm" variant="ghost" aria-label="Search"
          onClick={() => setLastAction('Search')}>
          <Icon icon={searchIcon} size="sm" />
        </Button>
        <Button type="button" iconOnly size="md" variant="ghost" aria-label="Save bookmark"
          onClick={() => setLastAction('Save bookmark')}>
          <Icon icon={bookmarkIcon} />
        </Button>
        <Button type="button" iconOnly size="lg" variant="ghost" aria-label="More options"
          onClick={() => setLastAction('More options')}>
          <Icon icon={moreHorizontalIcon} size="lg" />
        </Button>
      </Flow>
      <Text as="h2" variant="heading-sm">Emphasis and state</Text>
      <Flow direction="inline" wrap="wrap" align="center" gap="md">
        <Button type="button" iconOnly variant="secondary" aria-label="Share"
          onClick={() => setLastAction('Share')}>
          <Icon icon={shareIcon} />
        </Button>
        <Button type="button" iconOnly variant="primary" aria-label="Add bookmark"
          onClick={() => setLastAction('Add bookmark')}>
          <Icon icon={bookmarkIcon} />
        </Button>
        <Button type="button" iconOnly variant="secondary" loading aria-label="Saving bookmark">
          <Icon icon={bookmarkIcon} />
        </Button>
        <Button type="button" iconOnly variant="secondary" disabled aria-label="Close unavailable">
          <Icon icon={closeIcon} />
        </Button>
      </Flow>
      <Text as="h2" variant="heading-sm">Icon with text</Text>
      <Flow direction="inline" wrap="wrap" align="center" gap="md">
        <Button type="button" variant="secondary" onClick={() => setLastAction('Save bookmark')}>
          <Icon icon={bookmarkIcon} /> Save bookmark
        </Button>
      </Flow>
      <Text as="p" role="status">Last action: {lastAction}</Text>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
