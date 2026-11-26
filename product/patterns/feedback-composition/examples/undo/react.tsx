import { Text } from '@vyrnforge/react/text';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Alert } from '@vyrnforge/react/alert';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';

function Example() {
  const [archived, setArchived] = useState(false);
  const focusNext = useRef(false);
  const archive = useRef<HTMLButtonElement>(null);
  const undo = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    (archived ? undo : archive).current?.focus();
  }, [archived]);
  function change(next: boolean) {
    focusNext.current = true;
    setArchived(next);
  }
  return (
    <Flow gap="sm">
      <Button ref={archive} type="button" disabled={archived} onClick={() => change(true)}>
        Archive example report
      </Button>
      {archived && (
        <Alert
          severity="informational"
          heading="Report archived"
          actions={
            <Button ref={undo} type="button" variant="secondary" onClick={() => change(false)}>
              Undo archive
            </Button>
          }
        >
          You can restore this report from here or from the archive.
        </Alert>
      )}
      <Text as="p" role="status">{archived ? 'Report moved to archive.' : 'Report is active.'}</Text>
    </Flow>
  );
}

const host = document.querySelector('#root');
if (!host) throw new Error('Example mount is missing.');
createRoot(host).render(<Example />);
