import { createRoot } from 'react-dom/client';
import { Avatar, AvatarGroup } from '@vyrnforge/react/avatar';
import '@vyrnforge/web/styles/avatar.css';

function App() {
  return (
    <AvatarGroup label="Project contributors" size="lg" spacing="overlap">
      <Avatar name="Ada Lovelace" />
      <Avatar name="Alex Chen" initials="AC" />
      <Avatar name="Maria García" initials="MG" />
      <Avatar name="李 小明" initials="李明" />
    </AvatarGroup>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
