import { Input, type InputType } from '@vyrnforge/vue/input';

const type: InputType = 'url';
const input: typeof Input = Input;
// @ts-expect-error range adjustment remains owned by Slider.
const invalid: InputType = 'range';
void [type, input, invalid];
