import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Icon } from '@vyrnforge/react/icon';
import { Text } from '@vyrnforge/react/text';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';

const treatments = [
  { name: 'Default', color: 'var(--vf-color-text)' },
  { name: 'Accent', color: 'var(--vf-color-accent-background)' },
  { name: 'Muted', color: 'var(--vf-color-text-muted)' },
  { name: 'Danger', color: 'var(--vf-color-danger-border)' },
] as const;

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="lg" align="center">
      {treatments.map(({ name, color }) => (
        <Flow key={name} gap="xs" align="center" style={{ color }}>
          <Icon icon={bookmarkIcon} variant="filled" size="lg" />
          <Text as="span">{name}</Text>
        </Flow>
      ))}
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
