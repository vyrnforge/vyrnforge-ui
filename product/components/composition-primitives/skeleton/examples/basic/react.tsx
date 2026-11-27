import { createRoot } from 'react-dom/client';
import { Skeleton } from '@vyrnforge/react/skeleton';
import { Flow } from '@vyrnforge/react/layout';
import { Text } from '@vyrnforge/react/text';

function Example() {
  return (
    <Flow gap="md">
      <Flow aria-busy="true" gap="sm" style={{ inlineSize: 'min(100%, 20rem)' }}>
        <Flow direction="inline" align="center" gap="sm">
          <Skeleton shape="circle" />
          <Flow gap="xs" style={{ flex: 1 }}>
            <Skeleton />
            <Skeleton style={{ inlineSize: '60%' }} />
          </Flow>
        </Flow>
        <Skeleton shape="block" style={{ blockSize: '8rem' }} />
        <Skeleton animation="none" style={{ inlineSize: '80%' }} />
      </Flow>
      <Text as="p" role="status">
        Loading account summary
      </Text>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<Example />);
