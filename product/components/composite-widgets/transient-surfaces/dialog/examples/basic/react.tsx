import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from '@vyrnforge/react/dialog';
import { Button } from '@vyrnforge/react/button';

function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <DialogRoot open={open} onOpenChange={setOpen} backdropDismiss descriptionId="example-dialog-description">
        <DialogHeader divider>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription id="example-dialog-description">Update the fields you want to change.</DialogDescription>
        </DialogHeader>
        <DialogBody>Profile form content</DialogBody>
        <DialogFooter divider>
          <DialogClose data-vf-button="" data-vf-variant="secondary">
            Close
          </DialogClose>
        </DialogFooter>
      </DialogRoot>
    </>
  );
}

const mount = document.querySelector('#root');
if (!mount) throw new Error('Example mount is missing.');
createRoot(mount).render(<Example />);
