import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastClose, ToastDescription, ToastRoot, ToastTitle, ToastViewport } from '@vyrnforge/react/toast';
import { Button } from '@vyrnforge/react/button';

function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <p>Saved preferences are available in your account.</p>
      <Button type="button" onClick={() => setOpen(true)}>
        Show notification
      </Button>
      <ToastViewport>
        <ToastRoot open={open} onOpenChange={setOpen} duration={5000}>
          <ToastTitle>Saved</ToastTitle>
          <ToastDescription>Your preferences are up to date.</ToastDescription>
          <ToastClose aria-label="Dismiss notification">×</ToastClose>
        </ToastRoot>
      </ToastViewport>
    </>
  );
}

const mount = document.querySelector('#root');
if (!mount) throw new Error('Example mount is missing.');
createRoot(mount).render(<Example />);
