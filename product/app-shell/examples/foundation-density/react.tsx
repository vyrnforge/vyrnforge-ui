import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Field, Stack } from '@vyrnforge/react/layout';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { Surface } from '@vyrnforge/react/surface';
import { Switch } from '@vyrnforge/react/switch';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/foundation.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/native-select.css';
import '@vyrnforge/web/styles/surface.css';
import '@vyrnforge/web/styles/switch.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [appearance, setAppearance] = React.useState<'light' | 'dark'>('light');
  const [density, setDensity] = React.useState<'comfortable' | 'compact'>('comfortable');
  const [updates, setUpdates] = React.useState(true);

  return (
    <Surface
      as="form"
      aria-label="Foundation settings"
      data-vf-theme={appearance}
      data-vf-density={density}
      onSubmit={(event) => event.preventDefault()}
      style={{ inlineSize: 'min(100%, 36rem)', margin: '1rem auto', padding: '1rem' }}
    >
      <Stack>
        <Text as="h1" variant="heading">Interface settings</Text>
        <Text as="p" variant="body">Appearance and density are independent inherited presentation axes.</Text>

        <Field>
          <label htmlFor="foundation-appearance">Appearance</label>
          <NativeSelect id="foundation-appearance" value={appearance} onChange={(event) => setAppearance(event.currentTarget.value as 'light' | 'dark')}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </NativeSelect>
        </Field>

        <Field>
          <label htmlFor="foundation-density">Density</label>
          <NativeSelect id="foundation-density" value={density} onChange={(event) => setDensity(event.currentTarget.value as 'comfortable' | 'compact')}>
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </NativeSelect>
        </Field>

        <Field>
          <span id="foundation-updates-label">Product updates</span>
          <Switch aria-labelledby="foundation-updates-label" checked={updates} onChange={(event) => setUpdates(event.currentTarget.checked)} />
        </Field>

        <div>
          <Button type="submit">Save settings</Button>{' '}
          <Button type="button" variant="secondary">Cancel</Button>{' '}
          <Button type="button" size="sm" variant="secondary">Small action</Button>{' '}
          <Button type="button" size="lg" variant="secondary">Large action</Button>
        </div>

        <section data-density-reset data-vf-density="comfortable" aria-label="Nested comfortable scope">
          <Button type="button" variant="secondary">Nested comfortable action</Button>
        </section>
      </Stack>
    </Surface>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);