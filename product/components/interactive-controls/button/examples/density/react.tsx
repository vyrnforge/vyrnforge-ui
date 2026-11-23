import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/foundation.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/native-select.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  return (
    <Flow as="section" gap="md" data-vf-density={density}>
      <Flow gap="xs">
        <label htmlFor="button-density">Density</label>
        <NativeSelect id="button-density" value={density}
          onChange={event => setDensity(event.currentTarget.value as 'comfortable' | 'compact')}>
          <option value="comfortable">Comfortable</option>
          <option value="compact">Compact</option>
        </NativeSelect>
      </Flow>
      <Text as="h2" variant="heading-sm">Independent sizes</Text>
      <Flow direction="inline" wrap="wrap" align="center" gap="sm">
        <Button type="button" size="sm">Small</Button>
        <Button type="button" size="md">Medium</Button>
        <Button type="button" size="lg">Large</Button>
      </Flow>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
