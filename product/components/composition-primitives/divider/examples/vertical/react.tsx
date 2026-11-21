import { createRoot } from 'react-dom/client';
import { Flow } from '@vyrnforge/react/layout';
import { Divider } from '@vyrnforge/react/divider';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/divider.css';

function App() {
  return (
    <Flow direction="inline" gap="md">
      <span>Draft</span>
      <Divider orientation="vertical" />
      <span>Updated today</span>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
