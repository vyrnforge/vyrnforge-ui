import { createRoot } from 'react-dom/client';
import { Slider } from '@vyrnforge/react/slider';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

function App() {
  return (
    <Flow gap="lg">
      <Flow as="label" gap="sm">
        <Text>Automatic value tooltip</Text>
        <Slider defaultValue={50} tooltip />
      </Flow>
      <Flow as="label" gap="sm">
        <Text>Persistent percentage with arrow</Text>
        <Slider
          defaultValue={75}
          step={5}
          tooltip={{
            display: 'always',
            placement: 'top',
            size: 'sm',
            arrow: true,
            format: (value) => value + '%',
          }}
        />
      </Flow>
    </Flow>
  );
}
const root = document.querySelector('#root');
if (root) createRoot(root).render(<App />);
