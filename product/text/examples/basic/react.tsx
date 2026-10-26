import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Text } from '@vyrnforge/react/text';

function App() {
  return (
    <div className="vf-example-stack">
      <Text as="h2" variant="heading">Typography foundation</Text>
      <Text as="p">Native elements keep their semantics while VyrnForge supplies the visual typography contract.</Text>
      <Text as="p" variant="body-sm">Small body text remains readable without becoming a new semantic element.</Text>
      <Text variant="label">Account name</Text>
      <Text as="h3" variant="title">Section title</Text>
    </div>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
