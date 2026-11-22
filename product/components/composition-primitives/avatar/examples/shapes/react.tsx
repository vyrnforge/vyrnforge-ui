import { createRoot } from 'react-dom/client';
import { Avatar } from '@vyrnforge/react/avatar';
import { Icon } from '@vyrnforge/react/icon';
import { userIcon } from '@vyrnforge/icons/user';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/avatar.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return (
    <Flow direction="inline" gap="md" wrap="wrap">
      <Avatar name="Ada Lovelace" initials="AL" shape="rounded" size="lg" />
      <Avatar name="Ada Lovelace" initials="AL" shape="square" size="lg" />
      <Avatar name="Anonymous member" appearance="icon"
        icon={<Icon icon={userIcon} />} shape="square" size="lg" />
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
