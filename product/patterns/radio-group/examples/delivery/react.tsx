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
          <legend>Delivery method (required)</legend>
          <Flow gap="sm">
            <Flow as="label" direction="inline" align="center" gap="sm"><Radio name={name} value="Standard" required /> Standard — 3–5 days</Flow>
            <Flow as="label" direction="inline" align="center" gap="sm"><Radio name={name} value="Express" /> Express — next day</Flow>
            <Flow as="label" direction="inline" align="center" gap="sm"><Radio name={name} value="Pickup" disabled /> Pickup — unavailable</Flow>
          </Flow>
        </fieldset>
        <Flow direction="inline" wrap="wrap" gap="sm"><Button type="submit">Confirm delivery</Button><Button type="reset">Reset</Button></Flow>
        <Text as="p" role="status">{result}</Text>
      </Flow>
    </form>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
