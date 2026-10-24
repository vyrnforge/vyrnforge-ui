import { Portal as ReactPortal, type PortalProps } from '@vyrnforge/react/portal';
import { VfPortalDirective } from '@vyrnforge/angular/portal';
import { Portal as VuePortal } from '@vyrnforge/vue/portal';
import { VfPortalElement, definePortalElement } from '@vyrnforge/elements/portal';
const reactProps: PortalProps = { target: null };
void [ReactPortal, reactProps, VfPortalDirective, VuePortal, VfPortalElement, definePortalElement];
