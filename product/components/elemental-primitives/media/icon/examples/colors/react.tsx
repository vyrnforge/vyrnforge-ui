import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Icon } from '@vyrnforge/react/icon';
import { Text } from '@vyrnforge/react/text';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';

const treatments = [
  { name: 'Default', tone: 'text' },
  { name: 'Accent', tone: 'accent' },
  { name: 'Muted', tone: 'muted' },
  { name: 'Danger', tone: 'danger' },
] as const;

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="lg" align="center">
      {treatments.map(({ name, tone }) => (
        <Flow key={name} gap="xs" align="center">
          <Icon icon={bookmarkIcon} variant="filled" size="lg" tone={tone} />
          <Text as="span" tone={tone}>{name}</Text>
        </Flow>
      ))}
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
