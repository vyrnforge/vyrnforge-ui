import { useId } from 'react';
import { createRoot } from 'react-dom/client';
import { Slider } from '@vyrnforge/react/slider';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

function App() {
  const error = useId();
  return <Flow gap="lg">
    <Flow as="label" gap="xs"><Text>Unavailable volume</Text><Slider disabled defaultValue={30} /></Flow>
    <Flow as="label" gap="xs"><Text>Restricted volume</Text><Slider aria-invalid="true" aria-describedby={error} defaultValue={90} tooltip={{ display: 'always' }} /></Flow>
    <Text id={error} as="p" variant="body-sm" tone="danger">Choose a value within the allowed policy.</Text>
  </Flow>;
}
createRoot(document.querySelector('#root')!).render(<App />);
