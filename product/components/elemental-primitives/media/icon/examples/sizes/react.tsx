import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Icon } from '@vyrnforge/react/icon';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';

function App() {
  return <Flow direction="inline" wrap="wrap" gap="lg" align="center">
    {(['sm', 'md', 'lg'] as const).map((size) =>
      <Flow key={size} gap="xs" align="center">
        <Icon icon={bookmarkIcon} size={size} />
        <Text as="span">{size}</Text>
      </Flow>)}
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
