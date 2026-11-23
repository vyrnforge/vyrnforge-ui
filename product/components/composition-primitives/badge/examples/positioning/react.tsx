import { createRoot } from 'react-dom/client';
import { Badge } from '@vyrnforge/react/badge';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { Avatar } from '@vyrnforge/react/avatar';
import '@vyrnforge/web/styles/badge.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/avatar.css';

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="lg" align="center">
      <Badge badgeContent={1} anchorOrigin={{ vertical: 'top', horizontal: 'start' }}>
        <Button type="button" variant="secondary" aria-label="Start, one update">
          Start
        </Button>
      </Badge>
      <Badge badgeContent={2} anchorOrigin={{ vertical: 'bottom', horizontal: 'end' }} tone="accent">
        <Button type="button" variant="secondary" aria-label="End, two updates">
          End
        </Button>
      </Badge>
      <Badge variant="dot" overlap="circular" tone="accent"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'end' }}>
        <Avatar name="Profile, active" initials="AB" size="lg" />
      </Badge>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
