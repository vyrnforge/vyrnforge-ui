import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Backdrop } from '@vyrnforge/react/backdrop';
import { Loading, LoadingIndicator } from '@vyrnforge/react/loading';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';

function Example() {
  const [busy, setBusy] = useState(true);
  return <Flow gap="md">
    <Button type="button" onClick={() => setBusy(value => !value)}>{busy ? 'Finish refreshing' : 'Refresh account'}</Button>
    <section aria-label="Account summary" aria-busy={busy} style={{ position: 'relative', isolation: 'isolate', minBlockSize: '8rem', padding: 'var(--vf-space-md)', border: '1px solid var(--vf-color-border-required)', borderRadius: 'var(--vf-radius-surface)' }}>
      <div inert={busy}><p>Account details</p><Button type="button" variant="secondary">View statement</Button></div>
      <Backdrop hidden={!busy} />
      {busy && <Loading style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}><LoadingIndicator /></Loading>}
    </section>
    <p role="status">{busy ? 'Refreshing account summary' : 'Account summary ready'}</p>
  </Flow>;
}
createRoot(document.querySelector('#root')!).render(<Example />);
