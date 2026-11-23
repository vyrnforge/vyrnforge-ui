import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { List, ListItem } from '@vyrnforge/react/list';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/foundation.css';
import '@vyrnforge/web/styles/list.css';
import '@vyrnforge/web/styles/native-select.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  return (
    <section data-vf-density={density}>
      <label htmlFor="list-density">Density</label>{' '}
      <NativeSelect id="list-density" value={density}
        onChange={e => setDensity(e.currentTarget.value as 'compact' | 'comfortable')}>
        <option value="comfortable">Comfortable</option>
        <option value="compact">Compact</option>
      </NativeSelect>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <section key={size}>
          <Text as="h2" variant="heading-sm">Size {size}</Text>
          <List aria-label={size + ' tasks'} variant="divided" size={size}>
            <ListItem>Prepare release</ListItem>
            <ListItem>Review verification evidence</ListItem>
          </List>
        </section>
      ))}
    </section>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
