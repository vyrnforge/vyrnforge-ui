import { Portal, type PortalProps } from '@vyrnforge/react/portal';
const props: PortalProps = { target: null, disabled: true, children: 'content' };
const component: typeof Portal = Portal;
void [props, component];
