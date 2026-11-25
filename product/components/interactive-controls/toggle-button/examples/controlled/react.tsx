import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { boldIcon } from '@vyrnforge/icons/bold';
import { italicIcon } from '@vyrnforge/icons/italic';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';
import '@vyrnforge/web/styles/button.css';

function App() {
  const [cell, setCell] = useState<'A1' | 'A2'>('A1');
  const [boldByCell, setBoldByCell] = useState({ A1: true, A2: false });
  const [italic, setItalic] = useState(false);
  return (
    <Flow gap="md">
      <Flow direction="inline" wrap="wrap" gap="sm" role="group" aria-label="Select sample cell">
        <Button variant="ghost" onClick={() => setCell('A1')}>Select A1</Button>
        <Button variant="ghost" onClick={() => setCell('A2')}>Select A2</Button>
      </Flow>
      <Flow direction="inline" gap="xs" align="center">
        <ToggleButton iconOnly aria-label="Bold" title="Bold" pressed={boldByCell[cell]}
          onPressedChange={(next) => setBoldByCell((previous) => ({ ...previous, [cell]: next }))}>
          <Icon icon={boldIcon} />
        </ToggleButton>
        <Button variant="ghost" onClick={() => setBoldByCell((previous) => ({ ...previous, [cell]: false }))}>
          Reset bold
        </Button>
      </Flow>
      <Text as="p" data-example-preview="cell" style={{ fontWeight: boldByCell[cell] ? 700 : 400 }}>
        {cell}: {cell === 'A1' ? 'Revenue' : 'Expenses'}
      </Text>
      <Flow direction="inline" gap="sm" align="center">
        <ToggleButton iconOnly aria-label="Italic" title="Italic" onPressedChange={setItalic}>
          <Icon icon={italicIcon} />
        </ToggleButton>
        <Text as="span" data-example-preview="uncontrolled" style={{ fontStyle: italic ? 'italic' : 'normal' }}>
          Independent note
        </Text>
      </Flow>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
