import { createRoot } from 'react-dom/client';
import { Code, CodeBlock } from '@vyrnforge/react/code';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

export function CodeExample() {
  return (
    <Flow gap="sm">
      <Text as="p">Run <Code>pnpm test</Code> to verify your changes.</Text>
      <CodeBlock aria-label="Run the full unit suite">{'pnpm exec vitest run\n'}</CodeBlock>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<CodeExample />);
