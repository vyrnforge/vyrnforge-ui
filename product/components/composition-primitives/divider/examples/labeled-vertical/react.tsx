import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Divider } from '@vyrnforge/react/divider';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/divider.css';

function App() {
  return (
    <Flow as="section" direction="inline" gap="xl"
      aria-label="Vertical divider text alignment" style={{ minBlockSize: '12rem' }}>
      <Divider orientation="vertical" textAlign="start">Start</Divider>
      <Divider orientation="vertical">OR</Divider>
      <Divider orientation="vertical" textAlign="end">End</Divider>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
