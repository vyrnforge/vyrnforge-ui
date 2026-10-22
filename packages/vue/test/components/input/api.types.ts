import { Input, type InputType } from '@vyrnforge/vue/input';

const type: InputType = 'url';
const input: typeof Input = Input;
// @ts-expect-error specialized controls are outside the initial Input contract.
const invalid: InputType = 'range';
void [type, input, invalid];
