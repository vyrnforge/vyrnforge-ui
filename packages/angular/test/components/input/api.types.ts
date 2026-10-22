import { VfInputDirective, type InputType } from '@vyrnforge/angular/input';

const type: InputType = 'search';
const directive: typeof VfInputDirective = VfInputDirective;
// @ts-expect-error specialized controls are outside the initial Input contract.
const invalid: InputType = 'number';
void [type, directive, invalid];
