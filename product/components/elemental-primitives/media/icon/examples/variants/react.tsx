import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Icon } from '@vyrnforge/react/icon';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';

const treatments = [
  { variant: 'outlined', shape: 'rounded', name: 'Outlined rounded' },
  { variant: 'outlined', shape: 'sharp', name: 'Outlined sharp' },
  { variant: 'filled', shape: 'rounded', name: 'Filled rounded' },
  { variant: 'filled', shape: 'sharp', name: 'Filled sharp' },
] as const;

function App() {
  return <Flow direction="inline" wrap="wrap" gap="lg">
    {treatments.map(({ variant, shape, name }) =>
      <Flow key={name} gap="xs" align="center">
        <Icon icon={bookmarkIcon} variant={variant} shape={shape} />
        <Text as="span">{name}</Text>
      </Flow>)}
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
