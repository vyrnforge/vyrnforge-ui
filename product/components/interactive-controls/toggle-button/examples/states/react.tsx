import { createRoot } from 'react-dom/client';
import { ToggleButton } from '@vyrnforge/react/toggle-button';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/toggle-button.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  return (
    <Flow direction="inline" wrap="wrap" gap="sm">
      <ToggleButton>Bold</ToggleButton>
      <ToggleButton defaultPressed>Italic</ToggleButton>
      <ToggleButton disabled>Underline</ToggleButton>
      <ToggleButton defaultPressed disabled>Strikethrough</ToggleButton>
    </Flow>
  );
}
createRoot(document.querySelector('#root')!).render(<App />);
