import { createRoot } from 'react-dom/client';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

function App() {
  return <Flow gap="sm" align="center">
    {(['sm', 'md', 'lg'] as const).map(size => <Flow key={size} direction="inline" gap="lg" align="center" wrap="wrap">
      <Flow as="label" direction="inline" align="center" gap="sm">
        <Checkbox size={size} /><Text as="span">{size} unchecked</Text>
      </Flow>
      <Flow as="label" direction="inline" align="center" gap="sm">
        <Checkbox size={size} defaultChecked /><Text as="span">{size} checked</Text>
      </Flow>
    </Flow>)}
  </Flow>;
}
createRoot(document.querySelector('#root')!).render(<App />);
