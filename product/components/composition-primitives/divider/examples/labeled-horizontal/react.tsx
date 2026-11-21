import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Divider } from '@vyrnforge/react/divider';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/divider.css';

function App() {
  return (
    <Flow as="section" gap="lg" aria-label="Horizontal divider text alignment">
      <Divider textAlign="start">Start</Divider>
      <Divider>OR</Divider>
      <Divider textAlign="end">End</Divider>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
