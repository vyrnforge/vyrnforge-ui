import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleGroupRoot, ToggleGroupItem } from '@vyrnforge/react/toggle-group';
import { Icon } from '@vyrnforge/react/icon';
import { boldIcon } from '@vyrnforge/icons/bold';
import { italicIcon } from '@vyrnforge/icons/italic';
import { underlineIcon } from '@vyrnforge/icons/underline';
import { strikethroughIcon } from '@vyrnforge/icons/strikethrough';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { tokens } from '@vyrnforge/react';
import '@vyrnforge/web/styles/toggle-group.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [formats, setFormats] = useState(['bold']);
  return (
    <Flow gap="md">
      <Flow direction="inline">
        <ToggleGroupRoot
          type="multiple"
          defaultValue={['bold']}
          aria-label="Text formatting"
          onValueChange={(next) => {
            if (Array.isArray(next)) setFormats(next);
          }}
        >
          <ToggleGroupItem value="bold" data-vf-icon-only="" aria-label="Bold" title="Bold">
            <Icon icon={boldIcon} />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" data-vf-icon-only="" aria-label="Italic" title="Italic">
            <Icon icon={italicIcon} />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" data-vf-icon-only="" aria-label="Underline" title="Underline">
            <Icon icon={underlineIcon} />
          </ToggleGroupItem>
          <ToggleGroupItem value="strikethrough" data-vf-icon-only="" aria-label="Strikethrough" title="Strikethrough">
            <Icon icon={strikethroughIcon} />
          </ToggleGroupItem>
        </ToggleGroupRoot>
      </Flow>
      <Text
        as="p"
        data-example-preview="formatting"
        style={{
          border: '1px solid ' + tokens.color.borderStrong,
          padding: tokens.space.sm,
          background: tokens.color.surface,
          fontWeight: formats.includes('bold') ? tokens.fontWeight.bold : tokens.fontWeight.regular,
          fontStyle: formats.includes('italic') ? 'italic' : 'normal',
          textDecorationLine:
            [formats.includes('underline') && 'underline', formats.includes('strikethrough') && 'line-through']
              .filter(Boolean)
              .join(' ') || 'none',
        }}
      >
        Quarterly financial report
      </Text>
    </Flow>
  );
}

const root = document.querySelector('#root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
