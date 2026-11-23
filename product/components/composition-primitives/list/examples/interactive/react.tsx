import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { List, ListItem } from '@vyrnforge/react/list';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Button } from '@vyrnforge/react/button';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/foundation.css';
import '@vyrnforge/web/styles/list.css';
import '@vyrnforge/web/styles/checkbox.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [selected, setSelected] = useState<string[]>([]);
  const [details, setDetails] = useState('');
  const entries = ['Monthly report', 'Weekly report', 'Incident summary'];
  return (
    <section data-vf-density="compact">
      <Text as="p">{selected.length} of {entries.length} selected</Text>
      <List aria-label="Reports" variant="bordered" size="md" gutter="sm">
        {entries.map(name => (
          <ListItem key={name}
            leading={<Checkbox aria-label={'Select ' + name}
              checked={selected.includes(name)}
              onChange={e => setSelected(current =>
                e.currentTarget.checked ? [...current, name] : current.filter(item => item !== name))} />}
            trailing={<Button type="button" variant="secondary" size="sm"
              onClick={() => setDetails(name)}>Details</Button>}>
            <Text as="span">{name}</Text>
          </ListItem>
        ))}
      </List>
      <Text as="p" aria-live="polite">
        {details ? 'Details requested for ' + details : 'Select a report or view its details.'}
      </Text>
    </section>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
