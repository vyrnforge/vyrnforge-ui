import { Separator, type SeparatorOrientation } from '@vyrnforge/vue/separator';
const orientation: SeparatorOrientation = 'vertical';
const component: typeof Separator = Separator;
// @ts-expect-error unsupported orientation
const invalid: SeparatorOrientation = 'diagonal';
void [orientation, component, invalid];
