import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Alert } from '@vyrnforge/react/alert';
import { Button } from '@vyrnforge/react/button';
import { Icon } from '@vyrnforge/react/icon';
import { infoIcon } from '@vyrnforge/icons/info';
import { Flow } from '@vyrnforge/react/layout';
import '@vyrnforge/web/styles/alert.css';
import '@vyrnforge/web/styles/icon.css';
import '@vyrnforge/web/styles/layout.css';

function Example() {
  const [visible, setVisible] = useState(true);
  const [retried, setRetried] = useState(false);
  const restore = useRef<HTMLButtonElement>(null);
  return <Flow gap="sm">
    <Button ref={restore} type="button" variant="secondary" onClick={() => { setVisible(true); setRetried(false); }}>Restore feedback</Button>
    {visible && <Alert severity="warning" heading="Connection interrupted" icon={<Icon icon={infoIcon} />}
      dismiss={{ label: 'Dismiss connection message', onDismiss: () => { setVisible(false); restore.current?.focus(); } }}
      actions={<Button type="button" variant="secondary" onClick={() => setRetried(true)}>Retry</Button>}>
      Your changes remain on this device.
    </Alert>}
    <p role="status">{retried ? 'Retry requested' : ''}</p>
    <Alert severity="success" variant="outlined" heading="Saved">Your preferences are up to date.</Alert>
  </Flow>;
}
createRoot(document.querySelector('#root')!).render(<Example />);
