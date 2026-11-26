import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { TextField } from '@vyrnforge/react/text-field';
import { Button } from '@vyrnforge/react/button';
import { Text } from '@vyrnforge/react/text';
import { Flow } from '@vyrnforge/react/layout';

function Example() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const input = useRef<HTMLInputElement>(null);
  return (
    <Flow
      as="form"
      gap="md"
      onReset={() => {
        setValue('');
        setError('');
        setMessage('');
      }}
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim().length < 3) {
          setError('Enter at least three characters.');
          input.current?.focus();
        } else {
          setError('');
          setMessage('Profile saved in this example.');
        }
      }}
    >
      <TextField
        ref={input}
        label="Display name (required)"
        name="displayName"
        required
        value={value}
        onChange={(event) => {
          setValue(event.currentTarget.value);
          if (event.currentTarget.value.trim().length >= 3) setError('');
        }}
        description="Shown to your teammates."
        error={error}
        fullWidth
        trailing={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!value}
            onClick={() => {
              setValue('');
              input.current?.focus();
            }}
          >
            Clear
          </Button>
        }
      />
      <Flow direction="inline" gap="sm">
        <Button type="submit">Save</Button>
        <Button type="reset" variant="secondary">
          Reset
        </Button>
      </Flow>
      <Text as="p" role="status">{message}</Text>
    </Flow>
  );
}
const host = document.querySelector('#root');
if (host) createRoot(host).render(<Example />);
