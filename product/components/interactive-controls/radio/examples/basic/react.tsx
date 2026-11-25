import { useState, useId } from 'react';
import { createRoot } from 'react-dom/client';
import { Radio } from '@vyrnforge/react/radio';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/radio.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [method, setMethod] = useState('email');
  const name = useId();
  return (
    <fieldset>
      <legend>Receipt format</legend>
      <Flow gap="sm">
        <Flow as="label" direction="inline" align="center" gap="sm">
          <Radio name={name} value="email" checked={method === 'email'} onChange={() => setMethod('email')} /> Email receipt
        </Flow>
        <Flow as="label" direction="inline" align="center" gap="sm">
          <Radio name={name} value="paper" checked={method === 'paper'} onChange={() => setMethod('paper')} /> Printed receipt
        </Flow>
        <Text as="p" role="status">{method === 'email' ? 'A digital receipt will be sent.' : 'A receipt will be printed.'}</Text>
      </Flow>
    </fieldset>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
