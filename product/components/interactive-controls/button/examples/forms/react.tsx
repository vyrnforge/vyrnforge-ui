import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';

function App() {
  return (
    <form className="vf-example-stack" onSubmit={(event) => event.preventDefault()}>
      <label htmlFor="vf-button-form-value">Example value</label>
      <input id="vf-button-form-value" name="example" defaultValue="Original" />
      <Button type="submit" variant="primary">Submit form</Button>
      <Button type="reset" variant="secondary">Reset form</Button>
      <Button type="button" variant="ghost">Other action</Button>
    </form>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
