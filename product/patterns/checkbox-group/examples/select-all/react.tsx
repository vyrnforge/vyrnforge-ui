import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Checkbox } from '@vyrnforge/react/checkbox';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';
import '@vyrnforge/web/styles/checkbox.css';
import '@vyrnforge/web/styles/layout.css';
import '@vyrnforge/web/styles/text.css';

function App() {
  const eligible = ['Invoice.pdf', 'Summary.csv', 'Receipt.pdf'];
  const [selected, setSelected] = useState<string[]>(['Invoice.pdf']);
  const all = eligible.every(file => selected.includes(file));
  const mixed = selected.length > 0 && !all;
  return (
    <fieldset>
      <legend><Text as="strong">Files to export</Text></legend>
      <Flow gap="sm">
        <Flow as="label" direction="inline" align="center" gap="sm">
          <Checkbox checked={all} indeterminate={mixed} onChange={() => setSelected(all ? [] : eligible)} />
          <Text>Select all available files</Text>
        </Flow>
        {eligible.map(file => (
          <Flow key={file} as="label" direction="inline" align="center" gap="sm">
            <Checkbox checked={selected.includes(file)} onChange={event => {
              const checked = event.currentTarget.checked;
              setSelected(current => checked ? [...current, file] : current.filter(item => item !== file));
            }} /> <Text>{file}</Text>
          </Flow>
        ))}
        <Flow as="label" direction="inline" align="center" gap="sm">
          <Checkbox disabled />
          <Text>Archive.zip — unavailable</Text>
        </Flow>
        <Text as="p" role="status">{selected.length} of {eligible.length} available files selected.</Text>
      </Flow>
    </fieldset>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
