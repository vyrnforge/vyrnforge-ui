import { createRoot } from 'react-dom/client';
import { Avatar } from '@vyrnforge/react/avatar';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/avatar.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="md" align="center">
      <Avatar name="Ada Lovelace" size="sm" />
      <Avatar name="Ada Lovelace" />
      <Avatar name="Maria García" initials="MG" size="lg" />
      <Avatar name="李 小明" initials="李明" />
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
