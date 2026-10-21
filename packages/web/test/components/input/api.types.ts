import type { InputType } from '@vyrnforge/web/input';

const text: InputType = 'text';
const email: InputType = 'email';
// @ts-expect-error specialized controls are outside the initial Input contract.
const checkbox: InputType = 'checkbox';
void [text, email, checkbox];
