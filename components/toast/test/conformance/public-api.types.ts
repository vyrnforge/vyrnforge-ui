import type { ToastRootProps as ReactToastRootProps } from '@vyrnforge/react/toast';
import { VfToastRootDirective } from '@vyrnforge/angular/toast';
import { ToastRoot as VueToastRoot } from '@vyrnforge/vue/toast';
import { VfToastRootElement, defineToastRootElement, defineToastViewportElement } from '@vyrnforge/elements/toast';

type VueToastRootProps = InstanceType<typeof VueToastRoot>['$props'];

const reactRoot: ReactToastRootProps = {
  defaultOpen: true,
  duration: 5000,
  onOpenChange(open) { void open; },
};

const vueRoot: VueToastRootProps = {
  defaultOpen: true,
  duration: 5000,
  'onUpdate:open': (open: boolean) => { void open; },
};

declare const angularRoot: VfToastRootDirective;
angularRoot.open;
angularRoot.defaultOpen;
angularRoot.duration;
angularRoot.openChange;
angularRoot.requestClose();

declare const elementsRoot: VfToastRootElement;
elementsRoot.open = true;
elementsRoot.open = false;
elementsRoot.open = undefined;
elementsRoot.defaultOpen = true;
elementsRoot.duration = 5000;
elementsRoot.requestClose();

defineToastViewportElement;
defineToastRootElement;
void reactRoot;
void vueRoot;
