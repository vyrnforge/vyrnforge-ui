import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { NativeSelect } from '@vyrnforge/react/native-select';
import { Switch } from '@vyrnforge/react/switch';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/foundation.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';
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
      <div data-vf-flow data-vf-flow-direction="block" id="foundation-settings-stack">
        <Text as="h1" variant="heading-sm">Interface settings</Text>
        <Text as="p" variant="body-md">Appearance and density are independent inherited presentation axes.</Text>

        <div data-vf-flow data-vf-flow-direction="block" id="foundation-appearance-field" data-vf-flow-gap="xs">
          <label htmlFor="foundation-appearance">Appearance</label>
          <NativeSelect id="foundation-appearance" value={appearance} onChange={(event) => setAppearance(event.currentTarget.value as 'light' | 'dark')}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </NativeSelect>
        </div>

        <div data-vf-flow data-vf-flow-direction="block" data-vf-flow-gap="xs">
          <label htmlFor="foundation-density">Density</label>
          <NativeSelect id="foundation-density" value={density} onChange={(event) => setDensity(event.currentTarget.value as 'comfortable' | 'compact')}>
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </NativeSelect>
        </div>

        <div data-vf-flow data-vf-flow-direction="block" data-vf-flow-gap="xs">
          <Text as="span" id="foundation-updates-label">Product updates</Text>
          <Switch aria-labelledby="foundation-updates-label" checked={updates} onChange={(event) => setUpdates(event.currentTarget.checked)} />
        </div>

        <div>
          <Button type="submit">Save settings</Button>{' '}
          <Button type="button" variant="secondary">Cancel</Button>{' '}
          <Button type="button" size="sm" variant="secondary">Small action</Button>{' '}
          <Button type="button" size="lg" variant="secondary">Large action</Button>
        </div>

        <section data-density-reset data-vf-density="comfortable" aria-label="Nested comfortable scope">
          <Button type="button" variant="secondary">Nested comfortable action</Button>
        </section>
      </div>
    </form>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);