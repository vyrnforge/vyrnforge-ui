import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { boldIcon } from '@vyrnforge/icons/bold';
import { italicIcon } from '@vyrnforge/icons/italic';
import { underlineIcon } from '@vyrnforge/icons/underline';
import { strikethroughIcon } from '@vyrnforge/icons/strikethrough';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(true);
  return (
    <Flow gap="md">
      <Flow direction="inline" wrap="wrap" gap="xs" role="group" aria-label="Available formatting">
        <ToggleButton iconOnly aria-label="Bold" title="Bold" onPressedChange={setBold}>
          <Icon icon={boldIcon} />
        </ToggleButton>
        <ToggleButton iconOnly aria-label="Italic" title="Italic" defaultPressed onPressedChange={setItalic}>
          <Icon icon={italicIcon} />
        </ToggleButton>
        <ToggleButton iconOnly aria-label="Underline" title="Underline unavailable" disabled>
          <Icon icon={underlineIcon} />
        </ToggleButton>
        <ToggleButton iconOnly aria-label="Strikethrough" title="Strikethrough unavailable" disabled defaultPressed>
          <Icon icon={strikethroughIcon} />
        </ToggleButton>
      </Flow>
      <Text as="p" data-example-preview="states" style={{
        fontWeight: bold ? 700 : 400,
        fontStyle: italic ? 'italic' : 'normal',
        textDecorationLine: 'line-through',
      }}>
        Archived forecast
      </Text>
      <Text as="p" tone="secondary">Underline and existing strikethrough formatting are locked.</Text>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
