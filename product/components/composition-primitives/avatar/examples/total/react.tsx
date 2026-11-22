import { createRoot } from 'react-dom/client';
import { Avatar, AvatarGroup } from '@vyrnforge/react/avatar';
import '@vyrnforge/web/styles/avatar.css';

function App() {
  return (
    <AvatarGroup label="Review team" limit={3} total={12} size="md"
      formatOverflow={(count) => count + ' more reviewers'}>
      <Avatar name="Ada Lovelace" />
      <Avatar name="Alex Chen" />
      <Avatar name="Maria García" initials="MG" />
      <Avatar name="Grace Hopper" />
      <Avatar name="Lin Xu" initials="LX" />
    </AvatarGroup>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
