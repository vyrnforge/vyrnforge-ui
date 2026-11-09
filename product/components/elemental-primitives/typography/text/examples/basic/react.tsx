import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Text } from '@vyrnforge/react/text';

function App() {
  return (
    <div className="vf-example-stack">
      <Text as="h2" variant="heading-md">Typography foundation</Text>
      <Text as="p" variant="body-md">Native elements keep their semantics while VyrnForge supplies the visual typography contract.</Text>
      <Text as="blockquote" variant="body-lg">Semantic quotation with an independent visual role.</Text>
      <Text as="mark" variant="body-md">Important annotation</Text>
      <Text as="time" variant="caption" dateTime="2026-11-10">November 10, 2026</Text>
    </div>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
