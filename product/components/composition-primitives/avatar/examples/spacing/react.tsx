import { createRoot } from 'react-dom/client';
import { Avatar, AvatarGroup } from '@vyrnforge/react/avatar';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/avatar.css';
import '@vyrnforge/web/styles/layout.css';

function Members({ spacing }: { spacing: 'overlap' | 'none' | 'md' }) {
  return (
    <AvatarGroup label={'Contributors, ' + spacing + ' spacing'} spacing={spacing}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Alex Chen" />
      <Avatar name="Maria García" initials="MG" />
    </AvatarGroup>
  );
}

function App() {
  return (
    <Flow gap="md">
      <Flow gap="xs"><Text as="p">Overlap</Text><Members spacing="overlap" /></Flow>
      <Flow gap="xs"><Text as="p">No gap</Text><Members spacing="none" /></Flow>
      <Flow gap="xs"><Text as="p">Medium spacing</Text><Members spacing="md" /></Flow>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
