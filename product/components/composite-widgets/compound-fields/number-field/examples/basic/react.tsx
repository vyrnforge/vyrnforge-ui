import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { NumberField } from '@vyrnforge/react/number-field';
import { Flow } from '@vyrnforge/react/layout';

export function Example() {
  const [adjustment, setAdjustment] = useState<number | null>(null);
  return (
    <Flow gap="md">
      <NumberField label="Quantity" name="quantity" defaultValue={1} min={0} max={100} fullWidth />
      <NumberField
        label="Temperature in Celsius"
        defaultValue={-2.5}
        min={-20}
        max={40}
        step={0.1}
        suffix="°C"
        variant="filled"
        stepControls="stacked"
        incrementLabel="Increase temperature"
        decrementLabel="Decrease temperature"
        fullWidth
      />
      <NumberField
        label="Items per box"
        defaultValue={2}
        min={1}
        max={20}
        stepControls="horizontal"
        incrementLabel="Add item"
        decrementLabel="Remove item"
        fullWidth
      />
      <NumberField
        label="Amount in USD"
        defaultValue={null}
        min={0}
        step={0.01}
        prefix="$"
        labelPlacement="floating"
        textAlign="end"
        stepControls="none"
        fullWidth
      />
      <NumberField
        label="Adjustment"
        value={adjustment}
        onValueChange={setAdjustment}
        step="any"
        variant="underlined"
        fullWidth
      />
    </Flow>
  );
}

const root = document.querySelector('#root');
if (root) createRoot(root).render(<Example />);
