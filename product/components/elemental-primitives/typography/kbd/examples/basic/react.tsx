import { createRoot } from 'react-dom/client';
import { Kbd } from '@vyrnforge/react/kbd';
import { Text } from '@vyrnforge/react/text';

export function KbdExample() {
  return (
    <Text as="p">
      Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to open search.
    </Text>
  );
}

createRoot(document.querySelector('#root')!).render(<KbdExample />);
