import type { ToastRootProps as ReactToastRootProps } from '@vyrnforge/react/toast';

type AngularToastRoot = InstanceType<typeof import('@vyrnforge/angular/toast')['VfToastRootDirective']>;
type VueToastRoot = typeof import('@vyrnforge/vue/toast')['ToastRoot'];
type VueToastRootProps = InstanceType<VueToastRoot>['$props'];
type ElementsToastRoot = InstanceType<typeof import('@vyrnforge/elements/toast')['VfToastRootElement']>;
type DefineToastViewportElement = typeof import('@vyrnforge/elements/toast')['defineToastViewportElement'];
type DefineToastRootElement = typeof import('@vyrnforge/elements/toast')['defineToastRootElement'];

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

declare const angularRoot: AngularToastRoot;
angularRoot.open;
angularRoot.defaultOpen;
angularRoot.duration;
angularRoot.openChange;
angularRoot.requestClose();

declare const elementsRoot: ElementsToastRoot;
elementsRoot.open = true;
elementsRoot.open = false;
elementsRoot.open = undefined;
elementsRoot.defaultOpen = true;
elementsRoot.duration = 5000;
elementsRoot.requestClose();

declare const defineToastViewportElement: DefineToastViewportElement;
declare const defineToastRootElement: DefineToastRootElement;
defineToastViewportElement('vf-toast-viewport');
defineToastRootElement('vf-toast');
void reactRoot;
void vueRoot;
