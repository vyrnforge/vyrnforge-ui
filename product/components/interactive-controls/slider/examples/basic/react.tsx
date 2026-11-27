import { createRoot } from 'react-dom/client';
import { Slider } from '@vyrnforge/react/slider';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

function App() {
  return <Flow as="label" gap="xs">
    <Text>Volume</Text>
    <Slider name="volume" min={0} max={100} defaultValue={50} />
  </Flow>;
}
createRoot(document.querySelector('#root')!).render(<App />);
