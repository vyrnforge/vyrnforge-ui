import { ToastClose, ToastDescription, ToastRoot, ToastTitle, ToastViewport } from '@vyrnforge/react/toast';

export function Example() {
  return (
    <ToastViewport>
      <ToastRoot duration={0}>
        <ToastTitle>Tersimpan</ToastTitle>
        <ToastDescription>Perubahan Anda tersedia.</ToastDescription>
        <ToastClose aria-label="Tutup notifikasi">×</ToastClose>
      </ToastRoot>
    </ToastViewport>
  );
}
