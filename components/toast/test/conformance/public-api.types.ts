import type { ToastRootProps as ReactToastRootProps } from '@vyrnforge/react/toast';
import type { VfToastRootDirective } from '@vyrnforge/angular/toast';
import { ToastRoot as VueToastRoot } from '@vyrnforge/vue/toast';
import type { VfToastElement, ToastOpenChangeDetail } from '@vyrnforge/elements/toast';
import { h } from 'vue';

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

h(VueToastRoot, {
  open: true,
  defaultOpen: true,
  duration: 5000,
  'onUpdate:open': (open: boolean) => { void open; },
  onOpenChange: (open: boolean) => { void open; },
});

declare const element: VfToastElement;
element.open = true;
element.open = false;
element.open = undefined;
element.defaultOpen = true;
element.duration = 5000;
const detail: ToastOpenChangeDetail = { open: false };
void detail;
