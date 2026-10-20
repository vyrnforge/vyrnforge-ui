import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { DialogBody, DialogClose, DialogDescription, DialogRoot, DialogTitle } from '@vyrnforge/react/dialog';
import '@vyrnforge/web/styles/dialog.css';

function App() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open dialog</button>
      <DialogRoot
        id="example-dialog"
        open={open}
        onOpenChange={setOpen}
        backdropDismiss
        descriptionId="example-dialog-description"
      >
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription id="example-dialog-description">Update the fields you want to change.</DialogDescription>
        <DialogBody>Profile form content</DialogBody>
        <DialogClose>Close</DialogClose>
      </DialogRoot>
    </>
  );
}

createRoot(document.querySelector('#root')!).render(<App />);
