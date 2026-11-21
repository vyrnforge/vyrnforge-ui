import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Divider } from '@vyrnforge/react/divider';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/divider.css';

function App() {
  return (
    <Flow as="article" gap="md">
      <section><h3>Overview</h3><p>Project details.</p></section>
      <Divider />
      <section><h3>Activity</h3><p>Recent updates.</p></section>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
