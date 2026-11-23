import { createRoot } from 'react-dom/client';
import { Badge } from '@vyrnforge/react/badge';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';

import '@vyrnforge/web/styles/badge.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';


function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="lg" align="center">
      <Badge badgeContent={0}>
        <Button type="button" variant="secondary" aria-label="Hidden zero, no unread messages">
          Hidden zero
        </Button>
      </Badge>
      <Badge badgeContent={0} showZero tone="accent">
        <Button type="button" variant="secondary" aria-label="Shown zero, zero unread messages">
          Shown zero
        </Button>
      </Badge>
      <Badge badgeContent={7} invisible>
        <Button type="button" variant="secondary" aria-label="Invisible indicator, 7 unread messages">
          Invisible indicator
        </Button>
      </Badge>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
