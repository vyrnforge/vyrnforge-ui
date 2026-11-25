import { useState, useId } from 'react';
import { createRoot } from 'react-dom/client';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { Button } from '@vyrnforge/react/button';
import '@vyrnforge/web/styles/checkbox.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';
import '@vyrnforge/web/styles/button.css';

function App() {
  const [error, setError] = useState(false);
  const [result, setResult] = useState('Not submitted.');
  const message = useId();
  return (
    <form onSubmit={event => {
      event.preventDefault();
      const values = new FormData(event.currentTarget).getAll('section');
      setError(!values.length);
      setResult(values.length ? 'Report includes: ' + values.join(', ') : 'Not submitted.');
    }} onReset={() => { setError(false); setResult('Not submitted.'); }}>
      <Flow gap="md">
        <fieldset>
          <legend><Text as="strong">Report sections</Text></legend>
          <Flow gap="sm">
            {['Overview', 'Revenue', 'Expenses'].map(section => (
              <Flow key={section} as="label" direction="inline" align="center" gap="sm">
                <Checkbox name="section" value={section} aria-invalid={error || undefined} aria-describedby={message} onChange={() => setError(false)} /> <Text>{section}</Text>
              </Flow>
            ))}
            <Text as="p" id={message} role={error ? 'alert' : undefined}>{error ? 'Choose at least one section.' : 'Select one or more sections.'}</Text>
          </Flow>
        </fieldset>
        <Flow direction="inline" wrap="wrap" gap="sm"><Button type="submit">Generate report</Button><Button type="reset" variant="secondary">Reset</Button></Flow>
        <Text as="p" role="status">{result}</Text>
      </Flow>
    </form>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
