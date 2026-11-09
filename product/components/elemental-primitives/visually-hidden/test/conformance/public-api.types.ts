import type { VisuallyHiddenElement as ReactVisuallyHiddenElement, VisuallyHiddenProps as ReactVisuallyHiddenProps } from '@vyrnforge/react/visually-hidden';
import type { VisuallyHiddenElement as VueVisuallyHiddenElement } from '@vyrnforge/vue/visually-hidden';
type AngularDirectiveConstructor = typeof import('@vyrnforge/angular/visually-hidden').VfVisuallyHiddenDirective;

const element: ReactVisuallyHiddenElement = 'label';
const vueElement: VueVisuallyHiddenElement = element;
const props: ReactVisuallyHiddenProps = { as: 'span', id: 'accessible-label' };
type RuntimeExports = [AngularDirectiveConstructor];
// @ts-expect-error interactive hosts are deliberately outside this primitive's convenience element set
const invalid: ReactVisuallyHiddenElement = 'button';
void [element, vueElement, props, invalid];
void (null as unknown as RuntimeExports);
