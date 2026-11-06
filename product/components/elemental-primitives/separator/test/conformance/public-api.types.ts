import type { SeparatorOrientation as ReactSeparatorOrientation, SeparatorProps as ReactSeparatorProps } from '@vyrnforge/react/separator';
import type { SeparatorOrientation as VueSeparatorOrientation } from '@vyrnforge/vue/separator';
type AngularDirectiveConstructor = typeof import('@vyrnforge/angular/separator').VfSeparatorDirective;

const orientation: ReactSeparatorOrientation = 'vertical';
const vueOrientation: VueSeparatorOrientation = orientation;
const props: ReactSeparatorProps = { orientation: 'horizontal', id: 'section-divider' };
type RuntimeExports = [AngularDirectiveConstructor];
// @ts-expect-error unsupported orientation
const invalid: ReactSeparatorOrientation = 'diagonal';
void [orientation, vueOrientation, props, invalid];
void (null as unknown as RuntimeExports);
