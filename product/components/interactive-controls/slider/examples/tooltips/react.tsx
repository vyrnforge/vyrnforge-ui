import { useId, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Slider } from '@vyrnforge/react/slider';
import { Input } from '@vyrnforge/react/input';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import { Button } from '@vyrnforge/react/button';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '@vyrnforge/react/tooltip';

function App() {
  const id = useId();
  const [value, setValue] = useState(50);
  return <Flow gap="md">
    <Flow direction="inline" align="center" gap="sm">
      <label htmlFor={id}><Text>Volume</Text></label>
      <TooltipRoot>
        <TooltipTrigger><Button type="button" aria-label="About volume">Info</Button></TooltipTrigger>
        <TooltipContent>Adjust the playback volume.</TooltipContent>
      </TooltipRoot>
    </Flow>
    <Slider id={id} min={0} max={100} step={5} value={value}
      onChange={event => setValue(event.currentTarget.valueAsNumber)}
      valueLabelDisplay="auto" formatValue={number => number + '%'}
      marks={[{ value: 0, label: '0%' }, { value: 50, label: '50%' }, { value: 100, label: '100%' }]} />
    <Input aria-label="Exact volume" type="number" min={0} max={100} step={5} value={value}
      onChange={event => { const next = event.currentTarget.valueAsNumber; if (Number.isFinite(next)) setValue(Math.min(100, Math.max(0, Math.round(next / 5) * 5))); }} />
  </Flow>;
}
createRoot(document.querySelector('#root')!).render(<App />);
