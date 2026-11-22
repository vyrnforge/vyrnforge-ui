import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Button } from '@vyrnforge/react/button';
import { Input } from '@vyrnforge/react/input';

function App() {
  return (
    <Flow as="form" gap="md" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="vf-button-form-value">Example value</label>
      <Input id="vf-button-form-value" name="example" defaultValue="Original" />
      <Button type="submit" variant="primary">Submit form</Button>
      <Button type="reset" variant="secondary">Reset form</Button>
      <Button type="button" variant="ghost">Other action</Button>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
