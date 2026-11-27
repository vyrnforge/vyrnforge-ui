import { Text } from '@vyrnforge/react/text';
import { createRoot } from 'react-dom/client';
import { Loading, LoadingIndicator, LoadingCustom } from '@vyrnforge/react/loading';
import { Flow } from '@vyrnforge/react/layout';

function Example() {
  return (
    <Flow direction="block" gap="lg">
      <Loading size="lg">
        <Flow gap="md" align="center">
          <LoadingIndicator variant="spinner" />
          <LoadingIndicator variant="dots" />
          <LoadingIndicator variant="bars" />
          <LoadingIndicator variant="pulse" />
        </Flow>
      </Loading>
      <Text as="p" role="status">Loading account summary</Text>
      <LoadingCustom aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </LoadingCustom>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<Example />);
