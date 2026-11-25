import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const [showFormula, setShowFormula] = useState(false);
  return (
    <Flow gap="md">
      <Flow direction="inline">
        <ToggleButton onPressedChange={setShowFormula}>Show formulas</ToggleButton>
      </Flow>
      <Text as="p" data-example-preview="formula">
        {showFormula ? '=SUM(B2:B4)' : '23,800'}
      </Text>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
