import { ToastClose, ToastRoot, ToastViewport, type ToastRootProps } from '@vyrnforge/react/toast';

const rootProps: ToastRootProps = {
  open: true,
  defaultOpen: true,
  duration: 5000,
  onOpenChange(open) { void open; },
};

void ToastViewport;
void ToastRoot;
void ToastClose;
void rootProps;
