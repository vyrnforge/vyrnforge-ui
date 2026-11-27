import { useId } from 'react';
import { createRoot } from 'react-dom/client';
import { Radio } from '@vyrnforge/react/radio';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

function App() {
  const name = useId();
  return (
    <Flow gap="sm">
      {(['sm', 'md', 'lg'] as const).map(size => (
        <Flow as="fieldset" key={size} gap="sm">
          <legend><Text as="strong">{size}</Text></legend>
          <Flow direction="inline" wrap="wrap" gap="lg">
            <Flow as="label" direction="inline" align="center" gap="sm">
              <Radio name={name + size} value="standard" size={size} defaultChecked />
              <Text>Standard</Text>
            </Flow>
            <Flow as="label" direction="inline" align="center" gap="sm">
              <Radio name={name + size} value="express" size={size} />
              <Text>Express</Text>
            </Flow>
          </Flow>
        </Flow>
      ))}
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
