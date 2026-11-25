import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleGroupRoot, ToggleGroupItem } from '@vyrnforge/react/toggle-group';
import { Icon } from '@vyrnforge/react/icon';
import { alignLeftIcon } from '@vyrnforge/icons/align-left';
import { alignCenterIcon } from '@vyrnforge/icons/align-center';
import { alignRightIcon } from '@vyrnforge/icons/align-right';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { tokens } from '@vyrnforge/react';
import '@vyrnforge/web/styles/toggle-group.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [alignment, setAlignment] = useState('left');
  function acceptSelection(next: string | string[]) {
    if (typeof next === 'string') setAlignment(next);
  }
  return (
    <Flow gap="md">
      <Flow direction="inline">
        <ToggleGroupRoot
          type="single"
          defaultValue="left"
          aria-label="Horizontal alignment"
          onValueChange={acceptSelection}
        >
          <ToggleGroupItem value="left" data-vf-icon-only="" aria-label="Align left" title="Align left">
            <Icon icon={alignLeftIcon} />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" data-vf-icon-only="" aria-label="Align center" title="Align center">
            <Icon icon={alignCenterIcon} />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" data-vf-icon-only="" aria-label="Align right" title="Align right">
            <Icon icon={alignRightIcon} />
          </ToggleGroupItem>
        </ToggleGroupRoot>
      </Flow>
      <Text
        as="p"
        data-example-preview="alignment"
        style={{
          border: '1px solid ' + tokens.color.borderStrong,
          padding: tokens.space.sm,
          background: tokens.color.surface,
          textAlign: alignment === 'center' ? 'center' : alignment === 'right' ? 'right' : 'start',
        }}
      >
        Revenue
      </Text>
      <Text as="p" role="status" tone="secondary">
        Alignment: {alignment || 'automatic'}
      </Text>
    </Flow>
  );
}

const root = document.querySelector('#root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
