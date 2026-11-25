import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { wrapTextIcon } from '@vyrnforge/icons/wrap-text';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { tokens } from '@vyrnforge/react';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [wrapped, setWrapped] = useState(false);
  return (
    <Flow gap="md">
      <Flow direction="inline">
        <ToggleButton onPressedChange={setWrapped}>
          <Icon icon={wrapTextIcon} /> Wrap text
        </ToggleButton>
      </Flow>
      <Text as="p" data-example-preview="wrap" style={{
        border: '1px solid ' + tokens.color.borderStrong, padding: tokens.space.sm, background: tokens.color.surface,
        maxInlineSize: '16ch',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: wrapped ? 'normal' : 'nowrap',
      }}>
        Quarterly financial report for all departments
      </Text>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
