import type { ToastRootProps as ReactToastRootProps } from '@vyrnforge/react/toast';
import type { VfToastRootDirective } from '@vyrnforge/angular/toast';
import type { ToastRoot as VueToastRoot } from '@vyrnforge/vue/toast';
import type { VfToastElement, ToastOpenChangeDetail } from '@vyrnforge/elements/toast';

const reactProps: ReactToastRootProps = {
  defaultOpen: true,
  duration: 5000,
  onOpenChange(open) { void open; },
};
void reactProps;

declare const angularRoot: VfToastRootDirective;
const angularOpen: boolean | undefined = angularRoot.open();
const angularDuration: number = angularRoot.duration();
void angularOpen;
void angularDuration;

type VueToastRootProps = InstanceType<typeof VueToastRoot>['$props'];
const vueProps: VueToastRootProps = {
  open: true,
  defaultOpen: true,
  duration: 5000,
  'onUpdate:open': (open: boolean) => { void open; },
  onOpenChange: (open: boolean) => { void open; },
};
void vueProps;

declare const element: VfToastElement;
element.open = true;
element.open = false;
element.open = undefined;
element.defaultOpen = true;
element.duration = 5000;
const detail: ToastOpenChangeDetail = { open: false };
void detail;
