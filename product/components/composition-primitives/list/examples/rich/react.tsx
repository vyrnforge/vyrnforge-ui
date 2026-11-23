import { createRoot } from 'react-dom/client';
import { List, ListItem } from '@vyrnforge/react/list';
import { Avatar } from '@vyrnforge/react/avatar';
import { Text } from '@vyrnforge/react/text';
import { Flow } from '@vyrnforge/react/layout';
import { Button } from '@vyrnforge/react/button';
import '@vyrnforge/web/styles/list.css';
import '@vyrnforge/web/styles/avatar.css';
import '@vyrnforge/web/styles/text.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/button.css';

function App() {
  return (
    <List aria-label="Project team" variant="divided">
      {[
        ['Alex Chen', 'Product designer', 'AC'],
        ['Maria García', 'Frontend engineer', 'MG'],
        ['Taylor Park', 'QA engineer', 'TP'],
      ].map(([name, role, initials]) => (
        <ListItem key={name}
          leading={<Avatar name={name} initials={initials} />}
          trailing={<Button type="button" variant="secondary" size="sm"
            aria-label={'View ' + name}>View</Button>}>
          <Flow gap="xs">
            <Text as="strong">{name}</Text>
            <Text as="span" tone="secondary">{role}</Text>
          </Flow>
        </ListItem>
      ))}
    </List>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
