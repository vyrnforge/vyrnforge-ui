import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Radio } from '@vyrnforge/react/radio';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/radio.css';

function App() {
  const [selected, setSelected] = React.useState('standard');
  const [confirmed, setConfirmed] = React.useState<string | null>(null);

  return (
    <form onSubmit={(event) => { event.preventDefault(); setConfirmed(selected); }}>
      <fieldset>
        <legend>Delivery speed</legend>
        <label><Radio name="deliverySpeed" value="standard" checked={selected === 'standard'} onChange={() => setSelected('standard')} /> Standard</label>
        <label><Radio name="deliverySpeed" value="express" checked={selected === 'express'} onChange={() => setSelected('express')} /> Express</label>
        <label><Radio name="deliverySpeed" value="same-day" disabled /> Same day — unavailable</label>
      </fieldset>
      <Button type="submit">Confirm delivery speed</Button>
      <p role="status">{confirmed ? `Confirmed: ${confirmed}.` : 'Not confirmed.'}</p>
    </form>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
