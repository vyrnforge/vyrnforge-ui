import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Button } from '@vyrnforge/react/button';

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="md" align="center">
      <Button variant="primary" type="button">Save changes</Button>
      <Button variant="secondary" type="button">Preview</Button>
      <Button variant="ghost" type="button">Cancel</Button>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
