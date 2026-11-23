import { createRoot } from 'react-dom/client';
import { Badge } from '@vyrnforge/react/badge';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { Icon } from '@vyrnforge/react/icon';
import { bellIcon } from '@vyrnforge/icons/bell';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/badge.css';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="lg" align="center">
      <Badge variant="dot" tone="danger">
        <Button type="button" variant="secondary" aria-label="Alerts, new notifications">
          <Icon icon={bellIcon} /> Alerts
        </Button>
      </Badge>
      <Badge variant="dot" tone="accent">
        <Text as="span">Sync in progress</Text>
      </Badge>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
