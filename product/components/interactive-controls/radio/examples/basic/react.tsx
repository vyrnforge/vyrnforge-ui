import { useState, useId } from 'react';
import { createRoot } from 'react-dom/client';
import { Radio } from '@vyrnforge/react/radio';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

function App() {
  const [method, setMethod] = useState('email');
  const name = useId();
  return (
    <fieldset>
      <legend><Text as="strong">Receipt format</Text></legend>
      <Flow gap="sm">
        <Flow as="label" direction="inline" align="center" gap="sm">
          <Radio name={name} value="email" checked={method === 'email'} onChange={() => setMethod('email')} /> <Text>Email receipt</Text>
        </Flow>
        <Flow as="label" direction="inline" align="center" gap="sm">
          <Radio name={name} value="paper" checked={method === 'paper'} onChange={() => setMethod('paper')} /> <Text>Printed receipt</Text>
        </Flow>
        <Text as="p" role="status">{method === 'email' ? 'A digital receipt will be sent.' : 'A receipt will be printed.'}</Text>
      </Flow>
    </fieldset>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
