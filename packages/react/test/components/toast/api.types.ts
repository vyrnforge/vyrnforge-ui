import type { ToastRootProps } from '@vyrnforge/react/toast';
import { ToastClose, ToastRoot, ToastViewport } from '@vyrnforge/react/toast';

const props: ToastRootProps = {
  open: true,
  defaultOpen: true,
  duration: 5000,
  onOpenChange(open) { void open; },
  'aria-label': 'Saved notification',
};
void props;
void ToastRoot;
void ToastViewport;
void ToastClose;
