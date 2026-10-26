import { useState } from 'react';
import { ToastClose, ToastDescription, ToastRoot, ToastTitle, ToastViewport } from '@vyrnforge/react/toast';

export function Example() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Show notification</button>
      <ToastViewport>
        <ToastRoot open={open} onOpenChange={setOpen}>
          <ToastTitle>Saved</ToastTitle>
          <ToastDescription>Your changes are available.</ToastDescription>
          <ToastClose aria-label="Tutup notifikasi">×</ToastClose>
        </ToastRoot>
      </ToastViewport>
    </>
  );
}
