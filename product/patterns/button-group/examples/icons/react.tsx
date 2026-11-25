import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@vyrnforge/react/button';
import { Icon } from '@vyrnforge/react/icon';
import { copyIcon } from '@vyrnforge/icons/copy';
import { editIcon } from '@vyrnforge/icons/edit';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [action, setAction] = useState('No action yet');
  return (
    <Flow gap="md">
      <Flow direction="inline" gap="none" role="group" aria-label="Quick document actions"
        data-vf-button-group="">
        <Button iconOnly type="button" variant="secondary" aria-label="Edit document"
          onClick={() => setAction('Edited')}>
          <Icon icon={editIcon} />
        </Button>
        <Button iconOnly type="button" variant="secondary" aria-label="Copy document"
          onClick={() => setAction('Copied')}>
          <Icon icon={copyIcon} />
        </Button>
      </Flow>
      <Text as="p" role="status">{action}</Text>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
