import { createRoot } from 'react-dom/client';
import { Chip } from '@vyrnforge/react/chip';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/chip.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

const categories = ['React', 'Angular', 'TypeScript', 'CSS', 'Accessibility', 'Design tokens'];
function App() {
  return <Flow direction="inline" wrap="wrap" gap="sm">
    {categories.map(category => <Chip key={category} variant="outlined">{category}</Chip>)}
  </Flow>;
}

createRoot(document.querySelector('#root')!).render(<App />);
