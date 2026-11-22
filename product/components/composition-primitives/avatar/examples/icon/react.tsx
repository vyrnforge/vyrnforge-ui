import { createRoot } from 'react-dom/client';
import { Avatar } from '@vyrnforge/react/avatar';
import { Icon } from '@vyrnforge/react/icon';
import { userIcon } from '@vyrnforge/icons/user';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/avatar.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  const user = <Icon icon={userIcon} />;
  return (
    <Flow direction="inline" gap="md" wrap="wrap">
      <Avatar name="Anonymous member" appearance="icon" icon={user} size="lg" />
      <Avatar name="Alex Chen" src="/_missing_avatar_icon.webp"
        icon={<Icon icon={userIcon} />} fallback="icon" />
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
