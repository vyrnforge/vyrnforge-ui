import { useState, useId } from 'react';
import { createRoot } from 'react-dom/client';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/checkbox.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [include, setInclude] = useState(false);
  return (
    <Flow gap="sm">
      <Flow as="label" direction="inline" align="center" gap="sm">
        <Checkbox checked={include} onChange={event => setInclude(event.currentTarget.checked)} />
        Include a gift receipt
      </Flow>
      <Text as="p" role="status">{include ? 'Gift receipt will be included.' : 'Standard receipt only.'}</Text>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
