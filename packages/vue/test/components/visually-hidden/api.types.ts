import { VisuallyHidden, type VisuallyHiddenElement } from '@vyrnforge/vue/visually-hidden';
const element: VisuallyHiddenElement = 'label';
const component: typeof VisuallyHidden = VisuallyHidden;
// @ts-expect-error interactive hosts are deliberately excluded
const invalid: VisuallyHiddenElement = 'button';
void [element, component, invalid];
