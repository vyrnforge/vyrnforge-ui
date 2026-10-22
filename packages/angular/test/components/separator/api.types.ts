import { VfSeparatorDirective, type SeparatorOrientation } from '@vyrnforge/angular/separator';
const orientation: SeparatorOrientation = 'horizontal';
const directive: typeof VfSeparatorDirective = VfSeparatorDirective;
// @ts-expect-error unsupported orientation
const invalid: SeparatorOrientation = 'diagonal';
void [orientation, directive, invalid];
