import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Icon } from '@vyrnforge/react/icon';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';

function App() {
  const [saved, setSaved] = React.useState(false);
  return <Flow gap="md">
    <Flow direction="inline" gap="sm" align="center">
      <Button type="button" aria-label={saved ? 'Remove bookmark' : 'Save bookmark'}
        onClick={() => setSaved((value) => !value)}>
        <Icon icon={bookmarkIcon} variant={saved ? 'filled' : 'outlined'} />
      </Button>
      <Text as="span" role="status">{saved ? 'Saved' : 'Not saved'}</Text>
    </Flow>
    <Text as="p"><Icon icon={bookmarkIcon} label="Bookmark status" /> A separately named status symbol.</Text>
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
