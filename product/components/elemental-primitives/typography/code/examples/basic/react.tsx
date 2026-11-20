import { createRoot } from 'react-dom/client';
import { Code, CodeBlock } from '@vyrnforge/react/code';

export function CodeExample() {
  return (
    <section>
      <p>Run <Code>pnpm test</Code> to verify your changes.</p>
      <CodeBlock aria-label="Run the full unit suite">{'pnpm exec vitest run\n'}</CodeBlock>
    </section>
  );
}

createRoot(document.querySelector('#root')!).render(<CodeExample />);
