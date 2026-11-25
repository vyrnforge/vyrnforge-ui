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
  const [saved, setSaved] = useState('Not saved.');
  return (
    <form onSubmit={event => {
      event.preventDefault();
      const values = new FormData(event.currentTarget).getAll('channel');
      setSaved(values.length ? 'Saved: ' + values.join(', ') : 'No channels selected.');
    }} onReset={() => setSaved('Not saved.')}>
      <Flow gap="md">
        <fieldset>
          <legend>Notification channels</legend>
          <Flow gap="sm">
            <Flow as="label" direction="inline" align="center" gap="sm"><Checkbox name="channel" value="email" defaultChecked /> Email</Flow>
            <Flow as="label" direction="inline" align="center" gap="sm"><Checkbox name="channel" value="sms" /> SMS</Flow>
            <Flow as="label" direction="inline" align="center" gap="sm"><Checkbox name="channel" value="push" /> Push notifications</Flow>
          </Flow>
        </fieldset>
        <Flow direction="inline" wrap="wrap" gap="sm"><Button type="submit">Save preferences</Button><Button type="reset">Reset</Button></Flow>
        <Text as="p" role="status">{saved}</Text>
      </Flow>
    </form>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
