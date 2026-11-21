import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Divider } from '@vyrnforge/react/divider';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/divider.css';

function App() {
  return (
    <Flow as="section" direction="inline" gap="xl"
      aria-label="Vertical divider label directions" style={{ minBlockSize: '13rem' }}>
      <Divider orientation="vertical" textDirection="horizontal">OR</Divider>
      <Divider orientation="vertical">Next</Divider>
      <Divider orientation="vertical" textDirection="bottom-to-top">Previous</Divider>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
