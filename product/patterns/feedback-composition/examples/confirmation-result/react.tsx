import { Text } from '@vyrnforge/react/text';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogRoot,
  AlertDialogTitle,
} from '@vyrnforge/react/alert-dialog';
import { Alert } from '@vyrnforge/react/alert';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';

function Example() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Flow gap="sm">
      <Button type="button" onClick={() => setOpen(true)}>
        Review archive
      </Button>
      <AlertDialogRoot open={open} onOpenChange={setOpen} descriptionId="archive-description">
        <AlertDialogTitle>Archive this example report?</AlertDialogTitle>
        <AlertDialogDescription id="archive-description">
          The report will leave the active list. It can be restored from the archive.
        </AlertDialogDescription>
        <Flow direction="inline" gap="sm" wrap="wrap">
          <AlertDialogCancel autoFocus data-vf-button="" data-vf-variant="secondary">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction data-vf-button="" onClick={() => setConfirmed(true)}>
            Archive report
          </AlertDialogAction>
        </Flow>
      </AlertDialogRoot>
      <Text as="p" role="status">{confirmed ? 'Example report archived.' : ''}</Text>
      {confirmed && (
        <Alert severity="success" heading="Archive complete">
          The example report is available in the archive.
        </Alert>
      )}
    </Flow>
  );
}

const host = document.querySelector('#root');
if (!host) throw new Error('Example mount is missing.');
createRoot(host).render(<Example />);
