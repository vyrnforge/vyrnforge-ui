import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Slider } from '@vyrnforge/react/slider';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { Button } from '@vyrnforge/react/button';
function App() {
  const [value, setValue] = useState(40);
  return <Flow gap="lg">
    <Flow as="form" gap="sm">
      <Flow as="label" gap="xs"><Text>Uncontrolled</Text><Slider defaultValue={20} name="volume" valueLabelDisplay="always" /></Flow>
      <Button type="reset" variant="secondary">Reset native value</Button>
    </Flow>
    <Flow as="label" gap="xs">
      <Text>Controlled ({value}%)</Text>
      <Slider value={value} onChange={event => setValue(event.currentTarget.valueAsNumber)} valueLabelDisplay="auto" />
    </Flow>
  </Flow>;
}
createRoot(document.querySelector('#root')!).render(<App />);
