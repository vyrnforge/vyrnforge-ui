import { createRoot } from 'react-dom/client';
import { Badge } from '@vyrnforge/react/badge';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { Icon } from '@vyrnforge/react/icon';
import { mailIcon } from '@vyrnforge/icons/mail';
import '@vyrnforge/web/styles/badge.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/icon.css';

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="lg" align="center">
      <Badge badgeContent={4} tone="accent">
        <Button type="button" variant="secondary" aria-label="Inbox, 4 unread messages">
          <Icon icon={mailIcon} /> Inbox
        </Button>
      </Badge>
      <Badge badgeContent="NEW">
        <Button type="button" variant="secondary" aria-label="Files, new upload available">
          Files
        </Button>
      </Badge>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
