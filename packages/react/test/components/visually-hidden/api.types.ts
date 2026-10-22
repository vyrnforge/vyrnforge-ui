import { VisuallyHidden, type VisuallyHiddenElement, type VisuallyHiddenProps } from '@vyrnforge/react/visually-hidden';
const element: VisuallyHiddenElement = 'label';
const props: VisuallyHiddenProps = { as: element, id: 'hidden-label' };
const component: typeof VisuallyHidden = VisuallyHidden;
// @ts-expect-error interactive hosts are deliberately excluded
const invalid: VisuallyHiddenElement = 'button';
void [element, props, component, invalid];
