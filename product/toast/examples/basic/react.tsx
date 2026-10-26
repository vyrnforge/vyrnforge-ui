import { ToastClose, ToastDescription, ToastRoot, ToastTitle, ToastViewport } from '@vyrnforge/react/toast';

export function Example() {
  return (
    <ToastViewport>
      <ToastRoot duration={0}>
        <ToastTitle>Saved</ToastTitle>
        <ToastDescription>Your changes are available.</ToastDescription>
        <ToastClose aria-label="Tutup notifikasi">×</ToastClose>
      </ToastRoot>
    </ToastViewport>
  );
}
