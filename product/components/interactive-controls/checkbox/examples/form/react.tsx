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
  const [result, setResult] = useState('Not submitted.');
  const description = useId();
  return (
    <form onSubmit={event => {
      event.preventDefault();
      setResult(new FormData(event.currentTarget).get('accept') === 'yes' ? 'Consent recorded.' : 'Consent missing.');
    }} onReset={() => setResult('Not submitted.')}>
      <Flow gap="md">
        <Flow as="label" direction="inline" align="center" gap="sm">
          <Checkbox name="accept" value="yes" required aria-describedby={description} />
          <Text>I accept the service terms</Text>
        </Flow>
        <Text as="p" id={description}>Required before continuing.</Text>
        <Flow as="label" direction="inline" align="center" gap="sm">
          <Checkbox defaultChecked disabled /> <Text>Account verification complete</Text>
        </Flow>
        <Flow direction="inline" wrap="wrap" gap="sm">
          <Button type="submit">Continue</Button>
          <Button type="reset" variant="secondary">Reset</Button>
        </Flow>
        <Text as="p" role="status">{result}</Text>
      </Flow>
    </form>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
