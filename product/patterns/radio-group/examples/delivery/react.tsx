import { useState, useId } from 'react';
import { createRoot } from 'react-dom/client';
import { Radio } from '@vyrnforge/react/radio';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { Button } from '@vyrnforge/react/button';
import '@vyrnforge/web/styles/radio.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';
import '@vyrnforge/web/styles/button.css';

function App() {
  const [result, setResult] = useState('No delivery confirmed.');
  const name = useId();
  return (
    <form onSubmit={event => {
      event.preventDefault();
      setResult('Confirmed: ' + new FormData(event.currentTarget).get(name));
    }} onReset={() => setResult('No delivery confirmed.')}>
      <Flow gap="md">
        <fieldset>
          <legend><Text as="strong">Delivery method (required)</Text></legend>
          <Flow gap="sm">
            <Flow as="label" direction="inline" align="center" gap="sm">
              <Radio name={name} value="Standard" required />
              <Text>Standard — 3–5 days</Text>
            </Flow>
            <Flow as="label" direction="inline" align="center" gap="sm">
              <Radio name={name} value="Express" />
              <Text>Express — next day</Text>
            </Flow>
            <Flow as="label" direction="inline" align="center" gap="sm">
              <Radio name={name} value="Pickup" disabled />
              <Text>Pickup — unavailable</Text>
            </Flow>
          </Flow>
        </fieldset>
        <Flow direction="inline" wrap="wrap" gap="sm"><Button type="submit">Confirm delivery</Button><Button type="reset" variant="secondary">Reset</Button></Flow>
        <Text as="p" role="status">{result}</Text>
      </Flow>
    </form>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
