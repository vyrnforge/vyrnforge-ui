import { tokens } from '@vyrnforge/react';
import { Text } from '@vyrnforge/react/text';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Alert } from '@vyrnforge/react/alert';
import { Backdrop } from '@vyrnforge/react/backdrop';
import { Loading, LoadingIndicator } from '@vyrnforge/react/loading';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';

function Example() {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');
  const busy = phase === 'loading';
  return (
    <Flow gap="sm">
      <section
        aria-label="Account summary"
        aria-busy={busy}
        style={{ position: 'relative', isolation: 'isolate', minBlockSize: '8rem', padding: tokens.space.md }}
      >
        <Flow inert={busy} gap="sm">
          <Text as="p">Account summary</Text>
          <Button type="button" onClick={() => setPhase('loading')}>
            Refresh
          </Button>
        </Flow>
        <Backdrop hidden={!busy} />
        {busy && (
          <Loading style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
            <LoadingIndicator />
          </Loading>
        )}
      </section>
      <Text as="p" role="status">{busy ? 'Refreshing account' : phase === 'done' ? 'Account updated' : ''}</Text>
      {busy && (
        <Flow direction="inline" gap="sm" wrap="wrap">
          <Button type="button" onClick={() => setPhase('done')}>Complete example</Button>
          <Button type="button" variant="secondary" onClick={() => setPhase('error')}>Simulate failure</Button>
        </Flow>
      )}
      {phase === 'error' && (
        <Alert
          severity="error"
          heading="Refresh failed"
          actions={<Button type="button" onClick={() => setPhase('loading')}>Retry</Button>}
        >
          Your previous account summary is still available.
        </Alert>
      )}
    </Flow>
  );
}

const mount = document.querySelector('#root');
if (!mount) throw new Error('Example mount is missing.');
createRoot(mount).render(<Example />);
