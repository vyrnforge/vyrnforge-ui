import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';
import { arrowRightIcon } from '@vyrnforge/icons/arrow-right';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

const articles = ['Design tokens', 'Accessible interactions', 'Component composition'];

function App() {
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<number[]>([]);
  const bookmarked = saved.includes(index);

  return (
    <Flow gap="md">
      <Text as="p" variant="title-md" data-example-preview="article">{articles[index]}</Text>
      <Flow direction="inline">
        <Flow direction="inline" gap="none" data-vf-button-group="" role="group" aria-label="Article actions">
          <ToggleButton iconOnly aria-label="Bookmark article" title="Bookmark article" pressed={bookmarked}
            onPressedChange={(next) => setSaved((previous) =>
              next ? [...previous, index] : previous.filter((item) => item !== index))}>
            <Icon icon={bookmarkIcon} variant={bookmarked ? 'filled' : 'outlined'} />
          </ToggleButton>
          <Button iconOnly variant="secondary" aria-label="Next article" title="Next article"
            onClick={() => setIndex((previous) => (previous + 1) % articles.length)}>
            <Icon icon={arrowRightIcon} />
          </Button>
        </Flow>
      </Flow>
      <Text as="p" role="status" tone="secondary">{bookmarked ? 'Bookmarked' : 'Not bookmarked'}</Text>
    </Flow>
  );
}

const root = document.querySelector('#root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
