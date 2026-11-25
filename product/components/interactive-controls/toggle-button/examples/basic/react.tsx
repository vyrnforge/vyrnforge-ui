import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { boldIcon } from '@vyrnforge/icons/bold';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [pressed, setPressed] = useState(false);
  return (
    <Flow gap="md">
      <Flow direction="inline">
        <ToggleButton iconOnly aria-label="Bold" title="Bold" onPressedChange={setPressed}>
          <Icon icon={boldIcon} />
        </ToggleButton>
      </Flow>
      <Text as="p" data-example-preview="bold" style={{ fontWeight: pressed ? 700 : 400 }}>
        Quarterly financial report
      </Text>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
