import type { PortalProps } from '@vyrnforge/react/portal';

type ReactPortal = typeof import('@vyrnforge/react/portal').Portal;
type AngularPortal = typeof import('@vyrnforge/angular/portal').VfPortalDirective;
type VuePortal = typeof import('@vyrnforge/vue/portal').Portal;
type ElementsPortal = typeof import('@vyrnforge/elements/portal').VfPortalElement;
type DefinePortalElement = typeof import('@vyrnforge/elements/portal').definePortalElement;

const reactProps: PortalProps = { target: null };
declare const reactPortal: ReactPortal;
declare const angularPortal: AngularPortal;
declare const vuePortal: VuePortal;
declare const elementsPortal: ElementsPortal;
declare const definePortalElement: DefinePortalElement;
void [reactPortal, reactProps, angularPortal, vuePortal, elementsPortal, definePortalElement];
