import { Input, type InputProps, type InputType } from '@vyrnforge/react/input';

const type: InputType = 'email';
const props: InputProps = { type, name: 'email', required: true, readOnly: true, 'aria-describedby': 'email-help' };
const input: typeof Input = Input;
// @ts-expect-error specialized controls are outside the initial Input contract.
const invalid: InputProps = { type: 'checkbox' };
void [type, props, input, invalid];
