import { Flow } from '@vyrnforge/react/layout';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { Switch } from '@vyrnforge/react/switch';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/foundation.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/native-select.css';
import '@vyrnforge/web/styles/switch.css';
import '@vyrnforge/web/styles/text.css';
import './example.css';

function App() {
  const [appearance, setAppearance] = React.useState<'light' | 'dark'>('light');
  const [density, setDensity] = React.useState<'comfortable' | 'compact'>('comfortable');
  const [updates, setUpdates] = React.useState(true);

  return (
    <form
      aria-label="Foundation settings"
      data-vf-theme={appearance}
      data-vf-density={density}
      onSubmit={(event) => event.preventDefault()}
      className="vf-foundation-settings-demo"
    >
      <Flow id="foundation-settings-stack">
        <Text as="h1" variant="heading-sm">Interface settings</Text>
        <Text as="p" variant="body-md">Appearance and density are independent inherited presentation axes.</Text>

        <Flow id="foundation-appearance-field" gap="xs">
          <label htmlFor="foundation-appearance">Appearance</label>
          <NativeSelect id="foundation-appearance" value={appearance} onChange={(event) => setAppearance(event.currentTarget.value as 'light' | 'dark')}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </NativeSelect>
        </Flow>

        <Flow gap="xs">
          <label htmlFor="foundation-density">Density</label>
          <NativeSelect id="foundation-density" value={density} onChange={(event) => setDensity(event.currentTarget.value as 'comfortable' | 'compact')}>
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </NativeSelect>
        </Flow>

        <Flow gap="xs">
          <Text as="span" id="foundation-updates-label">Product updates</Text>
          <Switch aria-labelledby="foundation-updates-label" checked={updates} onChange={(event) => setUpdates(event.currentTarget.checked)} />
        </Flow>

        <Flow direction="inline" wrap="wrap" gap="sm">
          <Button type="submit">Save settings</Button>
          <Button type="button" variant="secondary">Cancel</Button>
          <Button type="button" size="sm" variant="secondary">Small action</Button>
          <Button type="button" size="lg" variant="secondary">Large action</Button>
        </Flow>

        <section data-density-reset data-vf-density="comfortable" aria-label="Nested comfortable scope">
          <Button type="button" variant="secondary">Nested comfortable action</Button>
        </section>
      </Flow>
    </form>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);