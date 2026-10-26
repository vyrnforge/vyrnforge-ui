import { ToastClose, ToastRoot, ToastViewport } from '@vyrnforge/vue/toast';

type ToastRootProps = InstanceType<typeof ToastRoot>['$props'];
const rootProps: ToastRootProps = {
  open: true,
  defaultOpen: true,
  duration: 5000,
  'onUpdate:open': (open: boolean) => { void open; },
};

void ToastViewport;
void ToastRoot;
void ToastClose;
void rootProps;
