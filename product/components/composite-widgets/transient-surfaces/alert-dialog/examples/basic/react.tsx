import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogRoot,
  AlertDialogTitle,
} from '@vyrnforge/react/alert-dialog';
import { Button } from '@vyrnforge/react/button';
import { Flow } from '@vyrnforge/react/layout';

function Example() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Flow gap="sm">
      <Button type="button" onClick={() => setOpen(true)}>
        Review deletion
      </Button>
      <AlertDialogRoot open={open} onOpenChange={setOpen} descriptionId="deletion-description">
        <AlertDialogTitle>Delete “Q4 Roadmap”?</AlertDialogTitle>
        <AlertDialogDescription id="deletion-description">
          This shared collection is used by 18 collaborators and cannot be restored.
        </AlertDialogDescription>
        <AlertDialogBody>This is a demonstration, not an actual deletion.</AlertDialogBody>
        <Flow direction="inline" gap="sm" wrap="wrap">
          <AlertDialogCancel autoFocus data-vf-button="" data-vf-variant="secondary">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction data-vf-button="" onClick={() => setConfirmed(true)}>
            Delete collection
          </AlertDialogAction>
        </Flow>
      </AlertDialogRoot>
      <p role="status">{confirmed ? 'Example decision confirmed' : ''}</p>
    </Flow>
  );
}

const mount = document.querySelector('#root');
if (!mount) throw new Error('Example mount is missing.');
createRoot(mount).render(<Example />);
