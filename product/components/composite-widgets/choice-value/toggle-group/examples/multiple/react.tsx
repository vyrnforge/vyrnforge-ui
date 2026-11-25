import { createRoot } from 'react-dom/client';
import { ToggleGroupRoot, ToggleGroupItem } from '@vyrnforge/react/toggle-group';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/toggle-group.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="sm">
      <ToggleGroupRoot type="multiple" defaultValue={['bold']} aria-label="Text formatting">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        <ToggleGroupItem value="underline" disabled>
          Underline
        </ToggleGroupItem>
      </ToggleGroupRoot>
    </Flow>
  );
}
const root = document.getElementById('root');
if (!root) throw new Error('Missing example root');
createRoot(root).render(<App />);
