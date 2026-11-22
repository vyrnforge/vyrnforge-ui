import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Divider } from '@vyrnforge/react/divider';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/divider.css';

function App() {
  return (
    <Flow direction="inline" gap="md">
      <Text as="span">Draft</Text>
      <Divider orientation="vertical" />
      <Text as="span">Updated today</Text>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
