import { createRoot } from 'react-dom/client';
import { Progress } from '@vyrnforge/react/progress';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

function Example() {
  return (
    <Flow gap="md">
      <Text as="p">Uploading file</Text>
      <Progress aria-label="Uploading file" value={48} max={100} />
      <Text as="p">Preparing import</Text>
      <Progress aria-label="Preparing import" />
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<Example />);
