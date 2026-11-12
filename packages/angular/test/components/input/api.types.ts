import { VfInputDirective, type InputType } from '@vyrnforge/angular/input';

const type: InputType = 'number';
const directive: typeof VfInputDirective = VfInputDirective;
// @ts-expect-error file selection remains a distinct L2 primitive.
const invalid: InputType = 'file';
void [type, directive, invalid];
