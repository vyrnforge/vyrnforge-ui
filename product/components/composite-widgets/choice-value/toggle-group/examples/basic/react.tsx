import { createRoot } from 'react-dom/client';
import { ToggleGroupRoot, ToggleGroupItem } from '@vyrnforge/react/toggle-group';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/toggle-group.css';
import '@vyrnforge/web/styles/layout.css';

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="sm">
      <ToggleGroupRoot type="single" defaultValue="week" aria-label="Time range">
        <ToggleGroupItem value="day">Day</ToggleGroupItem>
        <ToggleGroupItem value="week">Week</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroupRoot>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
