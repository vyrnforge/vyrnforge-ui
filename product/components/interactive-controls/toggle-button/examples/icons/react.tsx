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
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strike, setStrike] = useState(false);
  return (
    <Flow gap="md">
      <Flow direction="inline" wrap="wrap" gap="xs" role="group" aria-label="Independent text formatting">
        <ToggleButton iconOnly aria-label="Bold" title="Bold" onPressedChange={setBold}>
          <Icon icon={boldIcon} />
        </ToggleButton>
        <ToggleButton iconOnly aria-label="Italic" title="Italic" onPressedChange={setItalic}>
          <Icon icon={italicIcon} />
        </ToggleButton>
        <ToggleButton iconOnly aria-label="Underline" title="Underline" onPressedChange={setUnderline}>
          <Icon icon={underlineIcon} />
        </ToggleButton>
        <ToggleButton iconOnly aria-label="Strikethrough" title="Strikethrough" onPressedChange={setStrike}>
          <Icon icon={strikethroughIcon} />
        </ToggleButton>
      </Flow>
      <Text as="p" data-example-preview="formatting" style={{
        fontWeight: bold ? 700 : 400,
        fontStyle: italic ? 'italic' : 'normal',
        textDecorationLine: [underline && 'underline', strike && 'line-through'].filter(Boolean).join(' ') || 'none',
      }}>
        Quarterly financial report
      </Text>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
