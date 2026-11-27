import { createRoot } from 'react-dom/client';
import { Slider } from '@vyrnforge/react/slider';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

function App() {
  return <Flow gap="md">
    <Flow as="label" gap="xs"><Text>Small</Text><Slider size="sm" defaultValue={25} /></Flow>
    <Flow as="label" gap="xs"><Text>Medium</Text><Slider defaultValue={50} /></Flow>
    <Flow as="label" gap="xs"><Text>Large</Text><Slider size="lg" defaultValue={75} /></Flow>
    <Flow as="label" gap="xs"><Text>Vertical</Text><Slider orientation="vertical" defaultValue={65} valueLabelDisplay="always" /></Flow>
  </Flow>;
}
createRoot(document.querySelector('#root')!).render(<App />);
