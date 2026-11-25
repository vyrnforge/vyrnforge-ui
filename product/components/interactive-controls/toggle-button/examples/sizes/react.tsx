import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Icon } from '@vyrnforge/react/icon';
import { boldIcon } from '@vyrnforge/icons/bold';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { tokens } from '@vyrnforge/react';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [bold, setBold] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  return (
    <Flow gap="md">
      <Flow direction="inline" align="center" wrap="wrap" gap="sm" aria-label="Icon sizes" role="group">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ToggleButton key={size} size={size} iconOnly pressed={bold} onPressedChange={setBold}
            aria-label={'Bold (' + size + ')'} title={'Bold (' + size + ')'}>
            <Icon icon={boldIcon} size={size} />
          </ToggleButton>
        ))}
      </Flow>
      <Flow direction="inline" align="center" wrap="wrap" gap="sm" aria-label="Text sizes" role="group">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <ToggleButton key={size} size={size} pressed={showFormula} onPressedChange={setShowFormula}
            aria-label={'Show formulas (' + size + ')'}>
            Show formulas
          </ToggleButton>
        ))}
      </Flow>
      <Text as="p" data-example-preview="size" style={{
        border: '1px solid ' + tokens.color.borderStrong, padding: tokens.space.sm, background: tokens.color.surface,
        fontWeight: bold ? tokens.fontWeight.bold : tokens.fontWeight.regular,
      }}>
        {showFormula ? '=SUM(B2:B4)' : '23,800'}
      </Text>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
