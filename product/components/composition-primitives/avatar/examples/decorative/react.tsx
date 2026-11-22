import { createRoot } from 'react-dom/client';
import { Avatar } from '@vyrnforge/react/avatar';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/avatar.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return (
    <Flow direction="inline" gap="sm" align="center">
      <Avatar name="Ada Lovelace" decorative />
      <span>Ada Lovelace</span>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
