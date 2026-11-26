import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Input } from '@vyrnforge/react/input';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';

function Example() {
  const [value, setValue] = useState('');
  const [invalid, setInvalid] = useState(false);
  return (
    <Flow
      as="form"
      noValidate
      gap="sm"
      onSubmit={(event) => {
        event.preventDefault();
        const field = event.currentTarget.querySelector('input');
        setInvalid(!field?.validity.valid);
        if (!field?.validity.valid) field?.focus();
      }}
    >
      <label htmlFor="email">Email address</label>
      <Input
        id="email"
        type="email"
        required
        value={value}
        aria-invalid={invalid || undefined}
        aria-describedby="email-help"
        onChange={(event) => {
          setValue(event.currentTarget.value);
          if (event.currentTarget.validity.valid) setInvalid(false);
        }}
      />
      <p id="email-help">{invalid ? 'Enter a complete email address.' : 'Use your work email address.'}</p>
      <Button type="submit">Save</Button>
    </Flow>
  );
}

const mount = document.querySelector('#root');
if (!mount) throw new Error('Example mount is missing.');
createRoot(mount).render(<Example />);
