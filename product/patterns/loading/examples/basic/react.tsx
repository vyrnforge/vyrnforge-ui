import { createRoot } from 'react-dom/client';
import { Loading, LoadingIndicator, LoadingPlaceholder, LoadingProgress, LoadingCustom } from '@vyrnforge/react/loading';
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
      <Loading aria-busy="true">
        <Flow direction="block" gap="sm">
          <LoadingPlaceholder style={{ aspectRatio: '16 / 9' }} />
          <LoadingPlaceholder shape="line" style={{ inlineSize: '70%' }} />
          <LoadingPlaceholder shape="line" style={{ inlineSize: '45%' }} />
        </Flow>
      </Loading>
      <p role="status">Loading account summary</p>
      <LoadingProgress aria-label="Uploading file" value={48} max={100} />
      <LoadingProgress aria-label="Preparing import" />
      <LoadingCustom aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </LoadingCustom>
    </Flow>
  );
}

createRoot(document.querySelector('#root')!).render(<Example />);
