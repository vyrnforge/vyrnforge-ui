import { useState } from 'react';
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
  const [selected, setSelected] = useState('standard');
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const name = 'deliverySpeed';
  return (
    <form onSubmit={event => { event.preventDefault(); setConfirmed(selected); }}>
      <Flow gap="md">
        <fieldset>
          <legend><Text as="strong">Delivery speed</Text></legend>
          <Flow gap="sm">
            <Flow as="label" direction="inline" align="center" gap="sm">
              <Radio name={name} value="standard" checked={selected === 'standard'} onChange={() => setSelected('standard')} />
              <Text>Standard</Text>
            </Flow>
            <Flow as="label" direction="inline" align="center" gap="sm">
              <Radio name={name} value="express" checked={selected === 'express'} onChange={() => setSelected('express')} />
              <Text>Express</Text>
            </Flow>
            <Flow as="label" direction="inline" align="center" gap="sm">
              <Radio name={name} value="same-day" disabled />
              <Text>Same day — unavailable</Text>
            </Flow>
          </Flow>
        </fieldset>
        <Button type="submit">Confirm delivery speed</Button>
        <Text as="p" role="status">{confirmed ? `Confirmed: ${confirmed}.` : 'Not confirmed.'}</Text>
      </Flow>
    </form>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
