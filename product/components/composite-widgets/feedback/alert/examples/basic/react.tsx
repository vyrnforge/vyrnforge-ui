import { Text } from '@vyrnforge/react/text';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Alert } from '@vyrnforge/react/alert';
import { Button } from '@vyrnforge/react/button';
import { Icon } from '@vyrnforge/react/icon';
import { infoIcon } from '@vyrnforge/icons/info';
import { Flow } from '@vyrnforge/react/layout';

function Example() {
  const [visible, setVisible] = useState(true);
  const [retried, setRetried] = useState(false);
  const restore = useRef<HTMLButtonElement>(null);
  return (
    <Flow gap="sm">
      <Button
        ref={restore}
        type="button"
        variant="secondary"
        onClick={() => {
          setVisible(true);
          setRetried(false);
        }}
      >
        Restore feedback
      </Button>
      {visible && (
        <Alert
          severity="warning"
          heading="Connection interrupted"
          icon={<Icon icon={infoIcon} />}
          dismiss={{
            label: 'Dismiss connection message',
            onDismiss: () => {
              setVisible(false);
              restore.current?.focus();
            },
          }}
          actions={
            <Button type="button" variant="secondary" onClick={() => setRetried(true)}>
              Retry
            </Button>
          }
        >
          Your changes remain on this device.
        </Alert>
      )}
      <Text as="p" role="status">
        {retried ? 'Retry requested' : ''}
      </Text>
      <Alert severity="success" variant="outlined" heading="Saved">
        Your preferences are up to date.
      </Alert>
    </Flow>
  );
}
const host = document.querySelector('#root');
if (host) createRoot(host).render(<Example />);
