import { createRoot } from 'react-dom/client';
import { Slider } from '@vyrnforge/react/slider';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

function App() {
  return <Flow gap="lg">
    <Flow as="label" gap="xs"><Text>Continuous ratio</Text><Slider min={0} max={1} step="any" defaultValue={0.4} valueLabelDisplay="auto" formatValue={value => value.toFixed(2)} /></Flow>
    <Flow as="label" gap="xs"><Text>Discrete speed</Text><Slider min={0.5} max={2} step={0.5} defaultValue={1} valueLabelDisplay="always" formatValue={value => value + '×'} marks={[{ value: 0.5, label: '0.5×' }, { value: 1, label: '1×' }, { value: 2, label: '2×' }]} /></Flow>
  </Flow>;
}
createRoot(document.querySelector('#root')!).render(<App />);
