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
  const plans = [{ value: 'Starter', price: 12 }, { value: 'Team', price: 29 }, { value: 'Business', price: 59 }];
  const [selected, setSelected] = useState('Team');
  const name = useId();
  const plan = plans.find(item => item.value === selected)!;
  return (
    <form onReset={() => setSelected('Team')}>
      <Flow gap="md">
        <fieldset>
          <legend><Text as="strong">Monthly subscription</Text></legend>
          <Flow gap="sm">
            {plans.map(item => (
              <Flow key={item.value} as="label" direction="inline" align="center" gap="sm">
                <Radio name={name} value={item.value} checked={selected === item.value} onChange={() => setSelected(item.value)} />
                <Text>{item.value} — ${item.price}/month</Text>
              </Flow>
            ))}
          </Flow>
        </fieldset>
        <Text as="p" role="status">{plan.value}: ${plan.price} per month.</Text>
        <Button type="reset" variant="secondary">Restore original plan</Button>
      </Flow>
    </form>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
