import { createRoot } from 'react-dom/client';
import { Kbd } from '@vyrnforge/react/kbd';

export function KbdExample() {
  return (
    <p>
      Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to open search.
    </p>
  );
}

createRoot(document.querySelector('#root')!).render(<KbdExample />);
