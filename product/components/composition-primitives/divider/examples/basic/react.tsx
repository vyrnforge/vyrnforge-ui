import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Divider } from '@vyrnforge/react/divider';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/divider.css';

function App() {
  return (
    <Flow as="article" gap="md">
      <Flow as="section" gap="xs">
        <Text as="h3" variant="heading-sm">Overview</Text>
        <Text as="p">Project details.</Text>
      </Flow>
      <Divider />
      <Flow as="section" gap="xs">
        <Text as="h3" variant="heading-sm">Activity</Text>
        <Text as="p">Recent updates.</Text>
      </Flow>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
